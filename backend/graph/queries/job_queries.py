# Calculate match percentage for all jobs against a specific developer
GET_JOB_MATCHES = """
MATCH (j:Job)
OPTIONAL MATCH (j)-[:REQUIRES]->(req:Skill)
WITH j, count(req) AS total_reqs
OPTIONAL MATCH (j)-[:REQUIRES]->(req:Skill)<-[:HAS_SKILL]-(d:Developer {id: $dev_id})
WITH j, total_reqs, count(req) AS matched_reqs
RETURN j AS job, 
       total_reqs, 
       matched_reqs,
       CASE WHEN total_reqs = 0 THEN 100 ELSE toInteger((toFloat(matched_reqs)/total_reqs)*100) END AS match_percentage
ORDER BY match_percentage DESC
"""

# Job detail with role, location, company, required skills, technologies
GET_JOB_DETAIL = """
MATCH (j:Job {id: $job_id})
OPTIONAL MATCH (j)-[:FOR_ROLE]->(r:Role)
OPTIONAL MATCH (j)-[:LOCATED_IN]->(l:Location)
OPTIONAL MATCH (c:Company)-[:POSTED]->(j)
OPTIONAL MATCH (j)-[req_rel:REQUIRES]->(s:Skill)
WITH j, r, l, c, collect({skill: s, importance: req_rel.importance}) AS required_skills
OPTIONAL MATCH (j)-[:USES]->(t:Technology)
RETURN j AS job, r AS role, l AS location, c AS company,
       [x IN required_skills WHERE x.skill IS NOT NULL | x] AS required_skills,
       collect(DISTINCT t) AS technologies
"""

# Lightweight list of all jobs with attached role/location/company for filtering
LIST_JOBS = """
MATCH (j:Job)
OPTIONAL MATCH (j)-[:FOR_ROLE]->(r:Role)
OPTIONAL MATCH (j)-[:LOCATED_IN]->(l:Location)
OPTIONAL MATCH (c:Company)-[:POSTED]->(j)
RETURN j AS job, r AS role, l AS location, c AS company
ORDER BY j.created_at DESC
"""

# Find skills required by a specific job that a specific developer does not have
GET_MISSING_SKILLS = """
MATCH (j:Job {id: $job_id})-[:REQUIRES]->(req:Skill)
WHERE NOT EXISTS {
  MATCH (d:Developer {id: $dev_id})-[:HAS_SKILL]->(req)
}
RETURN req AS skill
"""

# Find similar jobs sharing at least 3 skills OR the same role
GET_SIMILAR_JOBS = """
MATCH (j1:Job {id: $job_id})
MATCH (j2:Job)
WHERE j1 <> j2
OPTIONAL MATCH (j1)-[:REQUIRES]->(s:Skill)<-[:REQUIRES]-(j2)
WITH j1, j2, count(s) AS shared_skills
OPTIONAL MATCH (j1)-[:FOR_ROLE]->(r:Role)<-[:FOR_ROLE]-(j2)
WITH j2, shared_skills, count(r) AS shared_roles
WHERE shared_skills >= 3 OR shared_roles > 0
RETURN j2 AS job, shared_skills, shared_roles
ORDER BY shared_skills DESC
"""
