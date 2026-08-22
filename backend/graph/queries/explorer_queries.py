# Fetch the immediate 1-hop neighborhood for any given node ID
GET_NODE_NEIGHBORHOOD = """
MATCH (n {id: $node_id})-[r]-(m)
RETURN labels(n)[0] AS source_label,
       n AS source_node,
       type(r) AS relationship,
       labels(m)[0] AS target_label,
       m AS target_node
"""

# Search across all node labels by name/title/city/country/email
SEARCH_NODES = """
MATCH (n)
WHERE toLower(coalesce(n.name, '')) CONTAINS toLower($q)
   OR toLower(coalesce(n.title, '')) CONTAINS toLower($q)
   OR toLower(coalesce(n.city, '')) CONTAINS toLower($q)
   OR toLower(coalesce(n.email, '')) CONTAINS toLower($q)
RETURN labels(n)[0] AS label, n AS node
LIMIT 20
"""
