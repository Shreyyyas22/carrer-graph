# Fetch developer by ID, along with their connected Location, Role, and Company (if any)
GET_DEVELOPER_PROFILE = """
MATCH (d:Developer {id: $dev_id})
OPTIONAL MATCH (d)-[:WORKED_AS]->(r:Role)
OPTIONAL MATCH (d)-[:LOCATED_IN]->(l:Location)
RETURN d AS developer, r AS role, l AS location
"""

# Fetch all skills for a developer, including proficiency and years
GET_DEVELOPER_SKILLS = """
MATCH (d:Developer {id: $dev_id})-[rel:HAS_SKILL]->(s:Skill)
RETURN s.id AS id, s.name AS name, s.category AS category, 
       rel.proficiency AS proficiency, rel.years AS years
ORDER BY rel.years DESC
"""
