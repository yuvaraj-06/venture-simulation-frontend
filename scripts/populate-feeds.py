import os
#!/usr/bin/env python3
"""Populate venture_activity_feed collection for all ventures from intelligence data."""
import sys, json, os, datetime
from pymongo import MongoClient

MONGO_URI = os.environ.get("MONGODB_URI", "")
client = MongoClient(MONGO_URI)
db = client.get_database('shareos')

# Get all ventures with simulations
sims = list(db.venture_simulations.find({}, {"cmny_id": 1, "simulation_metadata": 1}))
print(f"Found {len(sims)} ventures with simulations")

# Also get intelligence data from polsia collections
def get_intelligence(venture_id):
    """Mirror of what the API intelligence endpoint does."""
    data = {}
    
    # SEO
    seo = db.polsia_seo.find_one({"domain": {"$regex": venture_id, "$options": "i"}}, sort=[("audited_at", -1)])
    if not seo:
        seo = db.polsia_seo.find_one({"domain": {"$regex": venture_id.replace("_", ""), "$options": "i"}}, sort=[("audited_at", -1)])
    data['seo'] = seo
    
    # GEO
    geo = db.polsia_geo.find_one({"domain": {"$regex": venture_id, "$options": "i"}}, sort=[("checked_at", -1)])
    if not geo:
        geo = db.polsia_geo.find_one({"domain": {"$regex": venture_id.replace("_", ""), "$options": "i"}}, sort=[("checked_at", -1)])
    data['geo'] = geo
    
    # Goals from deals_internal
    company = db.deals_internal.find_one({"cmny_id": venture_id})
    if not company:
        company = db.deals_internal.find_one({"cmny_id": {"$regex": f"^{venture_id}$", "$options": "i"}})
    data['company'] = company
    
    # Feed events from polsia_feed
    feed = db.polsia_feed.find_one({"domain": {"$regex": venture_id, "$options": "i"}})
    data['feed'] = feed
    
    return data

def build_feed_items(venture_id, venture_name, intel):
    """Build actionable feed items from intelligence data."""
    items = []
    now = datetime.datetime.utcnow().isoformat()
    
    seo = intel.get('seo') or {}
    geo = intel.get('geo') or {}
    company = intel.get('company') or {}
    feed_data = intel.get('feed') or {}
    
    seo_score = int(seo.get('overall_score', 0) or 0)
    geo_score = int(geo.get('overall_score', 0) or 0)
    seo_issues = seo.get('issues', []) or []
    geo_platforms = geo.get('platforms', []) or []
    geo_recs = geo.get('recommendations', []) or []
    feed_events = feed_data.get('events', []) or []
    
    # Goals from deals_internal
    workstreams = []
    os_share = company.get('os_share', {}) or {}
    ws_list = os_share.get('workstreams', []) or []
    for ws in ws_list:
        ws_name = ws.get('name', '')
        goals = ws.get('goals', []) or []
        for goal in goals:
            g_name = goal.get('name', '')
            perf = int(goal.get('performanceScore', 0) or 0)
            exec_s = int(goal.get('executionScore', 0) or 0)
            try:
                target_val = int(float(goal.get('targetValuation', 0) or 0))
            except:
                target_val = 0
            milestones = goal.get('milestones', []) or []
            
            # Determine action type
            is_critical = perf == 0 and exec_s == 0
            is_behind = perf < 30 and perf > 0
            is_on_track = perf >= 50
            
            if is_on_track:
                continue  # Skip on-track goals
            
            # Build action details
            details = []
            not_started_tasks = []
            for m in milestones:
                for t in (m.get('tasks', []) or []):
                    if t.get('status') == 'not_started':
                        not_started_tasks.append(t.get('name', ''))
            
            if is_critical:
                details.append(f'Goal "{g_name}" has 0% performance and 0% execution. No work has started.')
                if milestones:
                    details.append(f'First milestone: "{milestones[0].get("name", "")}". Assign an owner and set a deadline.')
                if not_started_tasks:
                    details.append(f'Start with: {", ".join(not_started_tasks[:2])}')
            elif is_behind:
                details.append(f'Goal "{g_name}" is at {perf}% performance (execution: {exec_s}%). Behind target.')
                if not_started_tasks:
                    details.append(f'Unstarted tasks: {", ".join(not_started_tasks[:2])}')
                details.append('Review blockers and reassign resources if needed.')
            else:
                details.append(f'Goal "{g_name}" at {perf}% performance, {exec_s}% execution.')
                if not_started_tasks:
                    details.append(f'Next tasks: {", ".join(not_started_tasks[:2])}')
            
            # Get attributed agent
            agents = goal.get('attributed_agents', []) or []
            if agents:
                details.append(f'Attributed agent: {agents[0].get("agent_name", "").replace("-", " ")}')
            
            ws_icons = {'product': '🔧', 'demand': '📣', 'operations': '⚙️', 'team': '👥', 'partnerships': '🤝', 'investors': '💼', 'synergy': '🔗'}
            ws_colors = {'product': '#00d4ff', 'demand': '#ff8800', 'operations': '#00ff88', 'team': '#aa44ff', 'partnerships': '#ffcc00', 'investors': '#3B82F6', 'synergy': '#ff4400'}
            ws_lower = ws_name.lower()
            
            items.append({
                'type': 'goal',
                'source': ws_name,
                'sourceIcon': ws_icons.get(ws_lower, '📋'),
                'sourceColor': ws_colors.get(ws_lower, '#00d4ff'),
                'headline': f'{g_name}: Not started. Needs kickoff.' if is_critical else f'{g_name}: {perf}% performance. Falling behind.' if is_behind else f'{g_name}: {perf}% performance. Needs push.',
                'description': goal.get('goal_description', '') or goal.get('description', '') or f'{g_name} in {ws_name} workstream.',
                'actionType': 'action' if (is_critical or is_behind) else 'review',
                'actionLabel': 'Kickoff' if is_critical else 'Intervene' if is_behind else 'Review',
                'urgency': 'high' if (is_critical or is_behind) else 'medium',
                'workstream': ws_name,
                'details': details,
                'goalImpact': f'${int(target_val/1000)}K target' if target_val else None,
                'valuationAtStake': f'${int(target_val/1000)}K' if target_val else None,
                'goalName': g_name,
                'performanceScore': perf,
                'executionScore': exec_s,
                'created_at': now,
            })
    
    # Feed events (from polsia)
    for evt in feed_events:
        evt_type = evt.get('type', '')
        type_map = {
            'brand_dna': {'icon': '🎨', 'color': '#00d4ff', 'label': 'Brand'},
            'seo_audit': {'icon': '🔍', 'color': '#ff8800', 'label': 'SEO'},
            'geo_check': {'icon': '🌐', 'color': '#00ff88', 'label': 'GEO'},
            'competitors': {'icon': '⚔️', 'color': '#ff4400', 'label': 'Competitive Intel'},
            'patents': {'icon': '📜', 'color': '#aa44ff', 'label': 'IP/Patents'},
            'grants': {'icon': '💰', 'color': '#ffcc00', 'label': 'Grants'},
            'scrape': {'icon': '🔄', 'color': '#666666', 'label': 'Data Collection'},
            'simulation': {'icon': '🧪', 'color': '#3B82F6', 'label': 'Simulation'},
        }
        meta = type_map.get(evt_type, {'icon': '📋', 'color': '#00d4ff', 'label': evt_type.replace('_', ' ')})
        is_actionable = evt.get('status') != 'complete' or evt_type in ('competitors', 'grants')
        
        msg = str(evt.get('message', ''))
        # Derive headline
        if evt_type == 'competitors':
            headline = 'Competitive landscape updated. Review new threats.'
        elif evt_type == 'seo_audit':
            headline = f'SEO audit complete. Score: {seo_score}/100.'
        elif evt_type == 'grants':
            headline = 'New grant opportunities matched. Deadline approaching.'
        elif evt_type == 'brand_dna':
            headline = 'Brand DNA analysis ready for review.'
        elif evt_type == 'geo_check':
            headline = f'AI search visibility report ready. Score: {geo_score}/100.'
        elif evt_type == 'patents':
            headline = 'Patent landscape scan complete. White spaces identified.'
        else:
            headline = msg[:80] if msg else 'New update available'
        
        items.append({
            'type': 'event',
            'source': meta['label'],
            'sourceIcon': meta['icon'],
            'sourceColor': meta['color'],
            'headline': headline,
            'description': msg,
            'actionType': 'action' if is_actionable else 'review',
            'actionLabel': 'Act' if is_actionable else 'Review',
            'urgency': 'high' if evt.get('status') != 'complete' else 'medium',
            'date': evt.get('created_at'),
            'created_at': evt.get('created_at', now),
        })
    
    # SEO alert
    if seo_score > 0 and seo_score < 50:
        critical_count = sum(1 for i in seo_issues if isinstance(i, dict) and i.get('severity') == 'critical')
        items.append({
            'type': 'seo_alert',
            'source': 'SEO',
            'sourceIcon': '🔍',
            'sourceColor': '#ff8800',
            'headline': f'SEO score {seo_score}/100 with {critical_count} critical issues. Revenue at risk.',
            'description': f'The website has {len(seo_issues)} SEO issues, {critical_count} critical. This directly impacts organic discovery and CAC.',
            'actionType': 'action',
            'actionLabel': 'Fix Now',
            'urgency': 'high' if critical_count > 3 else 'medium',
            'details': [f'[{(i.get("severity","issue")).upper()}] {i.get("issue","") if isinstance(i, dict) else str(i)}' for i in seo_issues[:3]],
            'goalImpact': 'Demand > Organic Traffic',
            'created_at': now,
        })
    
    # GEO alert
    if geo_score > 0 and geo_score < 30:
        items.append({
            'type': 'geo_alert',
            'source': 'GEO',
            'sourceIcon': '🌐',
            'sourceColor': '#00ff88',
            'headline': f'AI visibility score {geo_score}/100. Invisible to ChatGPT, Claude, Gemini.',
            'description': 'The venture is not being cited by any major AI platform. This is a critical gap for discovery.',
            'actionType': 'action',
            'actionLabel': 'Fix Now',
            'urgency': 'high',
            'details': [f'{p.get("name")}: {p.get("score")}/100. {str(p.get("summary",""))[:100]}' for p in geo_platforms[:3]],
            'goalImpact': 'Demand > AI Discovery',
            'created_at': now,
        })
    
    # AI CMO Feed items
    cmo_items = []
    
    # SEO + GEO recs
    for iss in seo_issues:
        cmo_items.append({
            'section': 'seo_geo',
            'title': iss.get('issue', str(iss)) if isinstance(iss, dict) else str(iss),
            'severity': 'Critical' if isinstance(iss, dict) and iss.get('severity') == 'critical' else 'High',
            'category': iss.get('category', 'On-Page') if isinstance(iss, dict) else 'On-Page',
            'action': 'Fix',
        })
    for rec in geo_recs:
        title = rec if isinstance(rec, str) else rec.get('recommendation', rec.get('description', str(rec)))
        cmo_items.append({
            'section': 'seo_geo',
            'title': title,
            'severity': 'High',
            'category': 'GEO',
            'action': 'Fix',
        })
    for p in geo_platforms:
        if p.get('score', 100) < 20:
            cmo_items.append({
                'section': 'seo_geo',
                'title': f'{p["name"]}: Score {p["score"]}/100. {str(p.get("summary",""))[:100]}',
                'severity': 'Critical' if p['score'] < 5 else 'High',
                'category': 'AI Visibility',
                'action': 'Fix',
            })
    
    return {
        'venture_id': venture_id,
        'venture_name': venture_name,
        'feed_items': items,
        'cmo_feed': cmo_items,
        'total_items': len(items),
        'action_count': sum(1 for i in items if i['actionType'] == 'action'),
        'review_count': sum(1 for i in items if i['actionType'] == 'review'),
        'updated_at': now,
    }

# Process all ventures
collection = db.venture_activity_feed
total = 0
for sim in sims:
    cmny_id = sim.get('cmny_id', '')
    meta = sim.get('simulation_metadata', {})
    name = meta.get('venture_name', cmny_id)
    
    print(f"Processing {cmny_id} ({name})...", end=' ')
    intel = get_intelligence(cmny_id)
    feed_doc = build_feed_items(cmny_id, name, intel)
    
    collection.update_one(
        {"venture_id": cmny_id},
        {"$set": feed_doc},
        upsert=True
    )
    print(f"✓ {feed_doc['total_items']} items ({feed_doc['action_count']} actions, {feed_doc['review_count']} reviews)")
    total += 1

print(f"\nDone! Populated feeds for {total} ventures.")
