# CareerGraph — Graph-powered Career Exploration

A graph-first career platform: **Next.js → Django REST Framework → Neo4j driver → CognoDB (openCypher/Bolt)**, where *connections* are the query. Search jobs by skill overlap, see what you’re missing for any role with learning resources attached to skills, explore company → industry → tech, and trace career paths that are natural graph traversals.

**Live demo:** `https://carrer-graph-lfiv.vercel.app` · **API:** `https://carrer-graph.onrender.com/api/health` · **Recording:** `docs/demo.mp4`

---

## 1. Use case

Exploring a career is a graph problem, not a table problem:

- **As a developer** Alice (5 yrs, `Backend Engineer` in `Remote`) I want jobs ranked by *skill overlap* from the graph — not keyword search — and for each job the *missing* skills plus resources linked to those skills.
- **As a job seeker** I want to filter by role/location/remote/level/industry/skill *and* still see `match %` derived via `(:Developer)-[:HAS_SKILL]->(:Skill)<-[:REQUIRES]-(:Job)` (2 hops).
- **As a company explorer** I want `Company —POSTED→ Job —USES→ Technology` + `—IN_INDUSTRY→ Industry` in one hop.
- **As a planner** I want “who made the jump `Backend → Cloud Architect`?” via `WORKED_AS` intersection — a path a relational DB finds awkward.

Deep links matter: every job/company/skill can jump to the **Graph Explorer** at `/graph?node_id=…` to see its 1-hop neighborhood rendered, while the same data is also readable as lists (viz is not the only access).

---

## 2. Why a graph database?

A relational schema would model this as join tables: `developer_skills`, `job_requirements`, `job_technologies`, `company_jobs` — then matching becomes `JOIN` + `GROUP BY` + `COUNT` or recursive CTEs for similar jobs / career paths. In a property graph those joins *are* edges, and the interesting questions are traversals:

| Question | Relational pain | Graph expression |
|---|---|---|
| **Rank jobs for a developer** | 3 joins + anti-join for missing, `CASE WHEN total=0` | `MATCH (d:Developer {id:$dev_id})-[:HAS_SKILL]->(s)<-[:REQUIRES]-(j:Job) RETURN j, … match %` — 2 hops, one pass |
| **Similar jobs (≥3 shared skills OR same role)** | Self-join on requirements with `HAVING COUNT(*)>=3` UNION role join | `OPTIONAL MATCH (j1)-[:REQUIRES]->(s)<-[:REQUIRES]-(j2) … WHERE shared>=3 OR shared_roles>0` |
| **Skill gap + resources** | `NOT EXISTS` anti-join + separate lookup | `WHERE NOT EXISTS { MATCH (d)-[:HAS_SKILL]->(req) } … OPTIONAL MATCH (skill)-[:LEARNED_THROUGH]->(lr)` |
| **Career path / neighborhood** | Recursive CTE or 2-query intersection | `MATCH (d)-[:WORKED_AS]->(current) WHERE EXISTS {MATCH (d)-[:WORKED_AS]->(target)}` / `MATCH (n {id:$id})-[r]-(m)` 1-hop |

Traversals, variable-length `RELATED_TO` / `WORKED_AS` intersections, and `MATCH (n)-[r]-(m)` neighborhood are native Cypher; adding a new relation (e.g. `MENTORED_BY`) is a label, not a migration.

---

## 3. Setup & run

### 3.1 Create a CognoDB Cloud instance

1. https://console.cognodb.com/signup → free tier, no card.
2. **Create free c0** (0.5 vCPU/256 MB/1 GB) — <1 min. One per workspace.
3. Copy **once**: URI like `bolt+s://<id>.databases.cognodb.cloud` + **password for user `cognodb`**.

### 3.2 Backend

```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt  # Django==6.1 djangorestframework neo4j==6.2 python-dotenv django-cors-headers
# .env — never committed (.gitignore covers .env / .env.local)
cat > .env <<'ENV'
COGNODB_URI=bolt+s://<id>.databases.cognodb.cloud
COGNODB_USERNAME=cognodb
COGNODB_PASSWORD=<one-time password>
SECRET_KEY=$(python -c 'import secrets; print(secrets.token_urlsafe(32))')
DEBUG=True
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
ALLOWED_HOSTS=
ENV
python seed/seed_data.py        # clears, seeds 198 nodes — Alice stays 24e29a26… for frontend
python manage.py runserver 8000 # http://localhost:8000/api/health → {"status":"healthy"}
```

Free-tier note: dataset is ~200 nodes, well under c0 limits.

### 3.3 Frontend

```bash
cd frontend
npm install
cat > .env.local <<'ENV'
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_DEFAULT_DEVELOPER_ID=24e29a26-15ff-437b-92f5-5ba979467123  # MATCH (d:Developer) RETURN d.id — or keep Alice
ENV
npm run dev   # http://localhost:3000 (falls to 3001 if 3000 busy — both CORS-allowed)
npm run build # production check
```

Keep the c0 instance running until Wexa replies (submission §8).

---

## 4. Using the app

- **/** Dashboard — Alice’s role/location, 3 stat cards, skills, top matches with `%` (from the 2-hop match).
- **/profile** — developer header + `HAS_SKILL{proficiency,years}` list.
- **/jobs** — search + 6 filters (role/location/remote/level/skill/industry via server-side `Company-[:IN_INDUSTRY]` fan). Cards link to detail and show `match %` when `NEXT_PUBLIC_DEFAULT_DEVELOPER_ID` set.
- **/jobs/[id]** — detail (role/location/company, `REQUIRES` + `USES`), **skill gap** (`missing-skills` + per-skill `LEARNED_THROUGH` note), **similar** (≥3 shared skills OR same role).
- **/companies**, **/companies/[id]** — industry, aggregated `USES` tech, posted jobs.
- **/career-path** — pick `Backend → Cloud Architect` → Priya Sharma (or Marco/Sofia/Jamal/Elena per the 6-dev cohort). Same-role is blocked; no transition shows graceful empty with retry.
- **/graph** — search `Python` / `NovaTech` / `San Francisco` (2+ chars, `GET /api/search`), click a node → radial ring (pinned hub, `charge -260`, `link 92`) with node pills; edge types are in the **Neighbors** list, not the canvas blob. Click a node to re-center; `?q=&node_id=` deep-links.

All pages use skeletons on first load, actionable `EmptyState`, and `ErrorState` with `Try again`; DB-down (`code 0`/`503`) maps to “Graph database unavailable — check CognoDB” (no blank screens).

---

## 5. Deploy

- **Backend:** `https://carrer-graph.onrender.com` (Render, `backend/` · `gunicorn config.wsgi:application`) — `GET /api/health → {"status":"healthy"}` with `bolt+s://db-2bf16aa4.bravo.databases.cognodb.com` (c0, `us-east4`). Env: `COGNODB_URI/USERNAME/PASSWORD`, `SECRET_KEY`, `CORS_ALLOWED_ORIGINS=https://carrer-graph-lfiv.vercel.app,http://localhost:3000,http://localhost:3001`, `ALLOWED_HOSTS=.onrender.com`.
- **Frontend:** `https://carrer-graph-lfiv.vercel.app` (Vercel, `frontend/` · `next@15.5.23`) — `NEXT_PUBLIC_API_URL=https://carrer-graph.onrender.com`, `NEXT_PUBLIC_DEFAULT_DEVELOPER_ID=24e29a26-15ff-437b-92f5-5ba979467123` (Alice).
- Run full click-through on the live URL (dashboard → jobs → job detail → graph with `Python`). Keep the c0 instance running until Wexa replies.

---

*Stack: Next.js 15 + Tailwind + lucide-react + react-force-graph-2d, Django 6.1 + DRF, neo4j 6.2, CognoDB Cloud `bolt+s://`.*
