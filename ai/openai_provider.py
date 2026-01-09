"""
OpenAI API Provider Implementation
"""
import os
import json
from typing import Dict, Any, List, Optional
from openai import OpenAI
from ai.provider import AIProvider
from core.schemas import JDExtract, ResumeParse

class OpenAIProvider(AIProvider):
    """OpenAI API implementation of AIProvider"""
    
    def __init__(self):
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OPENAI_API_KEY not found in environment variables")
        
        model = os.getenv("OPENAI_MODEL", "gpt-4-turbo-preview")
        self.client = OpenAI(api_key=api_key)
        self.model = model
    
    def _call_llm(self, system_prompt: str, user_prompt: str, response_format: Dict = None, temperature: float = 0.3) -> str:
        """Make LLM call with error handling"""
        try:
            kwargs = {
                "model": self.model,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                "temperature": temperature
            }
            if response_format:
                kwargs["response_format"] = response_format
            
            response = self.client.chat.completions.create(**kwargs)
            return response.choices[0].message.content
        except Exception as e:
            raise Exception(f"OpenAI API error: {str(e)}")
    
    def extract_jd(self, jd_text: str) -> Dict[str, Any]:
        """Extract structured data from job description"""
        system_prompt = """You are an expert at analyzing job descriptions. Extract structured information and return ONLY valid JSON matching the JDExtract schema."""
        
        user_prompt = f"""Extract structured information from this job description:

{jd_text}

Return a JSON object with these exact fields:
- role_title: string
- seniority: one of "intern", "junior", "mid", "senior"
- must_have_skills: array of strings
- nice_to_have_skills: array of strings
- languages: array of strings (programming languages)
- frameworks: array of strings
- tools: array of strings
- responsibilities: array of strings
- keywords: array of strings (ATS keywords)
- domain: string (e.g., "telecom", "fintech", "web", "mobile")

Return ONLY the JSON, no markdown, no explanation."""
        
        response = self._call_llm(system_prompt, user_prompt, temperature=0.2)
        # Clean response (remove markdown code blocks if present)
        response = response.strip()
        if response.startswith("```json"):
            response = response[7:]
        if response.startswith("```"):
            response = response[3:]
        if response.endswith("```"):
            response = response[:-3]
        response = response.strip()
        
        try:
            return json.loads(response)
        except json.JSONDecodeError:
            # Fallback: try to extract JSON from response
            import re
            json_match = re.search(r'\{.*\}', response, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
            raise Exception("Failed to parse JD extraction as JSON")
    
    def parse_resume(self, resume_text: str) -> Dict[str, Any]:
        """Parse resume into structured format"""
        system_prompt = """You are an expert at parsing resumes. Extract structured information and return ONLY valid JSON matching the ResumeParse schema."""
        
        user_prompt = f"""Parse this resume text into structured format:

{resume_text}

Return a JSON object with these exact fields:
- identity: object with name, email, city, platforms (dict with linkedin, github, portfolio, etc.)
- skills: object with grouped categories (e.g., "languages": [...], "frameworks": [...], "tools": [...])
- experience: array of objects, each with company, role, dates, bullets (array of strings)
- projects: array of objects, each with title, tech_stack (array), bullets (array of strings)
- certifications: array of strings
- extracurriculars: array of strings
- education: array of objects with institution, degree, dates

Return ONLY the JSON, no markdown, no explanation."""
        
        response = self._call_llm(system_prompt, user_prompt, temperature=0.2)
        response = response.strip()
        if response.startswith("```json"):
            response = response[7:]
        if response.startswith("```"):
            response = response[3:]
        if response.endswith("```"):
            response = response[:-3]
        response = response.strip()
        
        try:
            return json.loads(response)
        except json.JSONDecodeError:
            import re
            json_match = re.search(r'\{.*\}', response, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
            raise Exception("Failed to parse resume as JSON")
    
    def build_evidence_map(self, jd_extract: Dict, resume_parse: Dict) -> Dict[str, Any]:
        """Build evidence map between JD and resume"""
        system_prompt = """You are an expert at matching job requirements to resume evidence. Create a detailed evidence map."""
        
        user_prompt = f"""Job Requirements:
{json.dumps(jd_extract, indent=2)}

Resume:
{json.dumps(resume_parse, indent=2)}

Create an evidence map showing:
1. For each keyword/skill in must_have_skills and nice_to_have_skills, list where it appears in the resume (section + bullet index)
2. List any missing keywords/skills that are must-haves

Return JSON with:
- evidence: object mapping keyword -> array of citations like {{"section": "projects", "index": 0, "bullet_index": 1}}
- missing: array of missing must-have keywords

Return ONLY the JSON, no markdown."""
        
        response = self._call_llm(system_prompt, user_prompt, temperature=0.3)
        response = response.strip()
        if response.startswith("```json"):
            response = response[7:]
        if response.startswith("```"):
            response = response[3:]
        if response.endswith("```"):
            response = response[:-3]
        response = response.strip()
        
        try:
            return json.loads(response)
        except json.JSONDecodeError:
            import re
            json_match = re.search(r'\{.*\}', response, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
            return {"evidence": {}, "missing": []}
    
    def compute_score_breakdown(self, jd_extract: Dict, resume_parse: Dict, evidence_map: Dict) -> Dict[str, Any]:
        """Compute ATS score breakdown"""
        system_prompt = """You are an expert ATS scoring system. Provide detailed, actionable scoring breakdown."""
        
        user_prompt = f"""Job Requirements:
{json.dumps(jd_extract, indent=2)}

Resume:
{json.dumps(resume_parse, indent=2)}

Evidence Map:
{json.dumps(evidence_map, indent=2)}

Compute ATS score breakdown with:
- keyword_coverage: score 0-100, details object
- alignment: score 0-100, details object
- evidence_strength: score 0-100, details object
- bullet_quality: score 0-100, details object with lint_results (array of bullet assessments)
- formatting: score 0-100, details object
- final_score: 0-100 (weighted average)
- top_fixes: array of top 3-7 prioritized fixes with target_location, constraint_rules, expected_score_impact

Return ONLY the JSON, no markdown."""
        
        response = self._call_llm(system_prompt, user_prompt, temperature=0.3)
        response = response.strip()
        if response.startswith("```json"):
            response = response[7:]
        if response.startswith("```"):
            response = response[3:]
        if response.endswith("```"):
            response = response[:-3]
        response = response.strip()
        
        try:
            return json.loads(response)
        except json.JSONDecodeError:
            import re
            json_match = re.search(r'\{.*\}', response, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
            return {"final_score": 0, "top_fixes": []}
    
    def create_rewrite_plan(self, score_breakdown: Dict, evidence_map: Dict) -> Dict[str, Any]:
        """Create rewrite plan with prioritized fixes"""
        # This is already computed in score_breakdown, so we can return it
        return {
            "prioritized_edits": score_breakdown.get("top_fixes", []),
            "expected_impact": "high"
        }
    
    def rewrite_bullet(self, bullet: str, constraints: Dict[str, Any], context: Dict[str, Any]) -> str:
        """Rewrite a single bullet point with constraints"""
        system_prompt = """You are an expert at rewriting resume bullets. Follow constraints strictly. Never hallucinate metrics."""
        
        user_prompt = f"""Rewrite this resume bullet:

"{bullet}"

Constraints:
{json.dumps(constraints, indent=2)}

Context:
{json.dumps(context, indent=2)}

Rules:
- Start with action verb
- Include tool/tech when relevant
- Include outcome/impact if available in context
- Never invent metrics (if no metric in context, omit it)
- Keep under 150 characters
- Be specific and concrete

Return ONLY the rewritten bullet, no explanation."""
        
        response = self._call_llm(system_prompt, user_prompt, temperature=0.4)
        return response.strip().strip('"').strip("'")

    def optimize_resume_parse(
        self,
        jd_extract: Dict[str, Any],
        resume_parse: Dict[str, Any],
        score_breakdown: Optional[Dict[str, Any]] = None,
        evidence_map: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Produce an optimized ResumeParse JSON for this job.
        Rules:
        - Do not invent employers, projects, or metrics.
        - You may reorder bullets/skills and rephrase bullets for clarity + ATS keywords.
        - Keep structure compatible with ResumeParse.
        """
        system_prompt = (
            "You are an expert ATS resume optimizer. Return ONLY valid JSON matching the ResumeParse schema. "
            "Never fabricate new experience, projects, or metrics."
        )

        user_prompt = f"""Job Requirements (JDExtract):
{json.dumps(jd_extract, indent=2)}

Current Resume (ResumeParse):
{json.dumps(resume_parse, indent=2)}

Optional Score Breakdown:
{json.dumps(score_breakdown or {{}}, indent=2)}

Optional Evidence Map:
{json.dumps(evidence_map or {{}}, indent=2)}

Task:
Create an improved ResumeParse JSON that increases ATS match for this job.

Hard rules:
- Do NOT add new employers, projects, certifications, or degrees.
- Do NOT invent numbers/metrics. If a bullet has no metric, keep it metric-free.
- Prefer incorporating JD must-have skills into existing bullets/skills where truthful.
- Keep bullets concise and action-oriented.
- Ensure all required fields exist and types match the ResumeParse schema.

Return ONLY the JSON, no markdown."""

        response = self._call_llm(system_prompt, user_prompt, temperature=0.3)
        response = response.strip()
        if response.startswith("```json"):
            response = response[7:]
        if response.startswith("```"):
            response = response[3:]
        if response.endswith("```"):
            response = response[:-3]
        response = response.strip()

        try:
            return json.loads(response)
        except json.JSONDecodeError:
            import re
            json_match = re.search(r'\{.*\}', response, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
            raise Exception("Failed to parse optimized resume as JSON")
    
    def generate_cover_letter(self, jd_extract: Dict, resume_parse: Dict, tone: str = "professional") -> str:
        """Generate cover letter"""
        system_prompt = """You are an expert at writing cover letters. Write a compelling, role-specific cover letter."""
        
        user_prompt = f"""Write a cover letter for this role:

Job: {jd_extract.get('role_title', '')} at {jd_extract.get('company', 'Company')}
Requirements: {', '.join(jd_extract.get('must_have_skills', [])[:5])}

Candidate: {resume_parse.get('identity', {}).get('name', 'Candidate')}
Experience: {json.dumps(resume_parse.get('experience', [])[:2], indent=2)}
Projects: {json.dumps(resume_parse.get('projects', [])[:2], indent=2)}

Requirements:
- Exactly 3 paragraphs
- Maximum 250 words total
- Include 2-4 keywords naturally from the job description
- Cite 1-2 specific proof points from resume/projects
- Tone: {tone}
- Role and company specific

Return ONLY the cover letter text, no headers, no explanations."""
        
        response = self._call_llm(system_prompt, user_prompt, temperature=0.7)
        return response.strip()
    
    def suggest_projects(self, jd_extract: Dict, resume_parse: Dict) -> List[Dict[str, Any]]:
        """Suggest projects for CS students"""
        system_prompt = """You are an expert at suggesting relevant projects for CS students based on job requirements."""
        
        user_prompt = f"""Job Requirements:
{json.dumps(jd_extract, indent=2)}

Current Resume:
{json.dumps(resume_parse, indent=2)}

Suggest 3-7 project ideas that would strengthen this resume for this role. Each project should include:
- title
- goal
- core_features (array)
- tech_stack (array)
- difficulty ("easy" or "medium")
- estimated_time (string like "2 weeks")
- potential_bullets (array of 2-3 example bullet points)

Return JSON array of project objects. Return ONLY the JSON array, no markdown."""
        
        response = self._call_llm(system_prompt, user_prompt, temperature=0.6)
        response = response.strip()
        if response.startswith("```json"):
            response = response[7:]
        if response.startswith("```"):
            response = response[3:]
        if response.endswith("```"):
            response = response[:-3]
        response = response.strip()
        
        try:
            return json.loads(response)
        except json.JSONDecodeError:
            import re
            json_match = re.search(r'\[.*\]', response, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
            return []
    
    def generate_roadmap(self, jd_extract: Dict, resume_parse: Dict, timeline_weeks: int = 4) -> Dict[str, Any]:
        """Generate learning roadmap"""
        system_prompt = """You are an expert at creating learning roadmaps for career preparation."""
        
        user_prompt = f"""Create a {timeline_weeks}-week learning roadmap:

Job Requirements:
{json.dumps(jd_extract, indent=2)}

Current Skills:
{json.dumps(resume_parse.get('skills', {}), indent=2)}

Create a structured roadmap with:
- timeline_weeks: {timeline_weeks}
- weeks: array of week objects, each with:
  - week_number
  - focus_areas (array)
  - tasks (array of task objects with title, description, resources, estimated_hours)
  - milestones (array)

Return ONLY the JSON, no markdown."""
        
        response = self._call_llm(system_prompt, user_prompt, temperature=0.5)
        response = response.strip()
        if response.startswith("```json"):
            response = response[7:]
        if response.startswith("```"):
            response = response[3:]
        if response.endswith("```"):
            response = response[:-3]
        response = response.strip()
        
        try:
            return json.loads(response)
        except json.JSONDecodeError:
            import re
            json_match = re.search(r'\{.*\}', response, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
            return {"timeline_weeks": timeline_weeks, "weeks": []}
    
    def generate_interview_question(self, jd_extract: Dict, mode: str, previous_questions: List[str] = None) -> Dict[str, Any]:
        """Generate interview question"""
        system_prompt = """You are an expert at creating interview questions tailored to job requirements."""
        
        mode_prompts = {
            "behavioural": "Generate a behavioural interview question based on the job responsibilities. Focus on STAR format scenarios.",
            "technical": "Generate a technical interview question based on the must-have skills. Include what the interviewer is looking for.",
            "mock": "Generate a mixed interview question (behavioural or technical)."
        }
        
        user_prompt = f"""Job Requirements:
{json.dumps(jd_extract, indent=2)}

Mode: {mode}
{mode_prompts.get(mode, mode_prompts['behavioural'])}

Previous questions: {previous_questions or []}

Return JSON with:
- question: string
- type: "behavioural" or "technical"
- what_interviewer_looks_for: string
- suggested_answer_structure: string (for behavioural) or key_points (for technical)

Return ONLY the JSON, no markdown."""
        
        response = self._call_llm(system_prompt, user_prompt, temperature=0.6)
        response = response.strip()
        if response.startswith("```json"):
            response = response[7:]
        if response.startswith("```"):
            response = response[3:]
        if response.endswith("```"):
            response = response[:-3]
        response = response.strip()
        
        try:
            return json.loads(response)
        except json.JSONDecodeError:
            import re
            json_match = re.search(r'\{.*\}', response, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
            return {"question": "Tell me about yourself.", "type": "behavioural"}
    
    def score_star_response(self, question: str, response: str, jd_extract: Dict) -> Dict[str, Any]:
        """Score STAR response"""
        system_prompt = """You are an expert at evaluating STAR interview responses using a rubric."""
        
        user_prompt = f"""Question: {question}

Response: {response}

Job Context:
{json.dumps(jd_extract, indent=2)}

Score this response using STAR rubric:
- Situation clarity: 0-20
- Task clarity: 0-20
- Action specificity: 0-20
- Result impact: 0-20
- Relevance to role: 0-20

Total: 0-100

Also provide:
- strengths: array of strings
- improvements: array of strings
- overall_feedback: string

Return ONLY the JSON, no markdown."""
        
        response_text = self._call_llm(system_prompt, user_prompt, temperature=0.3)
        response_text = response_text.strip()
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        if response_text.startswith("```"):
            response_text = response_text[3:]
        if response_text.endswith("```"):
            response_text = response_text[:-3]
        response_text = response_text.strip()
        
        try:
            return json.loads(response_text)
        except json.JSONDecodeError:
            import re
            json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
            return {"total_score": 0, "strengths": [], "improvements": []}
    
    def generate_coding_problem(self, jd_extract: Dict, difficulty: str = "medium") -> Dict[str, Any]:
        """Generate original coding problem"""
        system_prompt = """You are an expert at creating original coding interview problems. Never copy LeetCode problems."""
        
        user_prompt = f"""Job Requirements:
{json.dumps(jd_extract, indent=2)}

Difficulty: {difficulty}

Create an ORIGINAL coding problem (not from LeetCode) that tests skills relevant to this role.

Return JSON with:
- title: string
- topic: string (e.g., "arrays", "hashmaps", "strings", "graphs")
- difficulty: "{difficulty}"
- prompt: string (problem description)
- examples: array of example objects with input, output, explanation
- constraints: array of strings
- test_cases: array of test case objects with input, expected_output
- hints: array of strings (optional)

Return ONLY the JSON, no markdown."""
        
        response = self._call_llm(system_prompt, user_prompt, temperature=0.7)
        response = response.strip()
        if response.startswith("```json"):
            response = response[7:]
        if response.startswith("```"):
            response = response[3:]
        if response.endswith("```"):
            response = response[:-3]
        response = response.strip()
        
        try:
            return json.loads(response)
        except json.JSONDecodeError:
            import re
            json_match = re.search(r'\{.*\}', response, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
            return {"title": "Problem", "prompt": "", "test_cases": []}
    
    def review_code(self, problem: Dict, code: str, test_results: Dict) -> Dict[str, Any]:
        """Review code solution"""
        system_prompt = """You are an expert at reviewing code solutions for correctness, edge cases, and complexity."""
        
        user_prompt = f"""Problem:
{json.dumps(problem, indent=2)}

Solution Code:
{code}

Test Results:
{json.dumps(test_results, indent=2)}

Review the code and provide:
- correctness: "correct", "partial", or "incorrect"
- edge_cases_handled: boolean
- time_complexity: string
- space_complexity: string
- feedback: string
- suggestions: array of strings

Return ONLY the JSON, no markdown."""
        
        response = self._call_llm(system_prompt, user_prompt, temperature=0.3)
        response = response.strip()
        if response.startswith("```json"):
            response = response[7:]
        if response.startswith("```"):
            response = response[3:]
        if response.endswith("```"):
            response = response[:-3]
        response = response.strip()
        
        try:
            return json.loads(response)
        except json.JSONDecodeError:
            import re
            json_match = re.search(r'\{.*\}', response, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
            return {"correctness": "unknown", "feedback": "Unable to review code"}

