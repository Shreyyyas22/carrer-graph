# Lookup tables needed for filter UIs and career-path pickers

LIST_ROLES = """
MATCH (r:Role)
RETURN r AS role
ORDER BY r.name
"""

LIST_LOCATIONS = """
MATCH (l:Location)
RETURN l AS location
ORDER BY l.city
"""

LIST_INDUSTRIES = """
MATCH (i:Industry)
RETURN i AS industry
ORDER BY i.name
"""

LIST_SKILLS = """
MATCH (s:Skill)
RETURN s AS skill
ORDER BY s.name
"""
