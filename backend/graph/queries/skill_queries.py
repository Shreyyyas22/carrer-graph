# Find LearningResource nodes connected via LEARNED_THROUGH
GET_LEARNING_RESOURCES = """
MATCH (s:Skill {id: $skill_id})-[:LEARNED_THROUGH]->(lr:LearningResource)
RETURN lr AS resource
"""

# Given a Technology, find other Jobs that use that Technology
GET_RELATED_TECH_JOBS = """
MATCH (t:Technology {id: $tech_id})<-[:USES]-(j:Job)
RETURN DISTINCT j AS job
"""

# Show developers who successfully made a Role transition
GET_CAREER_PATH_TRANSITIONS = """
MATCH (current:Role {id: $current_role_id})
MATCH (target:Role {id: $target_role_id})
MATCH (d:Developer)-[:WORKED_AS]->(current)
WHERE EXISTS { MATCH (d)-[:WORKED_AS]->(target) }
RETURN d AS developer
"""
