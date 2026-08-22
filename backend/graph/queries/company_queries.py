# List all companies with their industry and job count
LIST_COMPANIES = """
MATCH (c:Company)
OPTIONAL MATCH (c)-[:IN_INDUSTRY]->(i:Industry)
OPTIONAL MATCH (c)-[:POSTED]->(j:Job)
RETURN c AS company, i AS industry, count(j) AS job_count
ORDER BY c.name
"""

# Company detail (company node + its industry)
GET_COMPANY_DETAIL = """
MATCH (c:Company {id: $company_id})
OPTIONAL MATCH (c)-[:IN_INDUSTRY]->(i:Industry)
RETURN c AS company, i AS industry
"""

# Technologies used across all jobs posted by a company (aggregated)
GET_COMPANY_TECHNOLOGIES = """
MATCH (c:Company {id: $company_id})-[:POSTED]->(j:Job)-[:USES]->(t:Technology)
RETURN DISTINCT t AS technology
"""

# Find all jobs POSTED by a specific Company, along with Role and Location
GET_COMPANY_JOBS = """
MATCH (c:Company {id: $company_id})-[:POSTED]->(j:Job)
OPTIONAL MATCH (j)-[:FOR_ROLE]->(r:Role)
OPTIONAL MATCH (j)-[:LOCATED_IN]->(l:Location)
RETURN j AS job, r AS role, l AS location
"""
