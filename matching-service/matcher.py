import os
import json
import google.generativeai as genai
from typing import List, Dict

class SkillMatcher:
    def __init__(self):
        api_key = os.environ.get('GEMINI_API_KEY', '')
        self.use_ai = bool(api_key and api_key != 'your_gemini_api_key_here')
        
        if self.use_ai:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-1.5-flash')
            print("✅ Gemini AI initialized for intelligent matching")
        else:
            self.model = None
            print("⚠️  No Gemini API key found, using algorithmic matching")

    def find_matches(self, user_id: str, user_name: str, 
                     teaching_skills: List[Dict], learning_skills: List[Dict],
                     availability: Dict, all_users: List[Dict]) -> List[Dict]:
        """Find best matches using Gemini AI or fallback algorithm"""
        
        if self.use_ai and all_users:
            return self._ai_match(user_id, user_name, teaching_skills, 
                                  learning_skills, availability, all_users)
        return self._algorithmic_match(user_id, teaching_skills, 
                                       learning_skills, all_users)

    def _ai_match(self, user_id, user_name, teaching_skills, 
                  learning_skills, availability, all_users) -> List[Dict]:
        """Use Gemini API for intelligent skill matching"""
        try:
            prompt = f"""You are an expert skill matching algorithm. Analyze the following user's profile and find the best matches from the candidate list.

TARGET USER:
- Name: {user_name}
- Skills they can TEACH: {json.dumps(teaching_skills)}
- Skills they want to LEARN: {json.dumps(learning_skills)}
- Availability: {json.dumps(availability)}

CANDIDATE USERS:
{json.dumps(all_users, indent=2)}

MATCHING CRITERIA:
1. Skill Complementarity (40%): How well do the candidates' teaching skills match what the target user wants to learn, and vice versa?
2. Experience Level Compatibility (25%): Are the skill levels appropriate for effective learning? (e.g., advanced teaching beginner is ideal)
3. Category Overlap (20%): Do the users share interest in similar technology domains?
4. Mutual Benefit (15%): Can both users benefit from the exchange?

Return a JSON array of the top matches (max 10) with this EXACT format:
[
  {{
    "userId": "candidate_user_id",
    "name": "candidate_name",
    "score": 85.5,
    "matchedSkills": {{
      "canTeachMe": ["skill1", "skill2"],
      "iCanTeach": ["skill3"]
    }},
    "reasoning": "Brief explanation of why this is a good match"
  }}
]

Return ONLY valid JSON array, no other text."""

            response = self.model.generate_content(prompt)
            text = response.text.strip()
            
            # Extract JSON from response
            if '```json' in text:
                text = text.split('```json')[1].split('```')[0]
            elif '```' in text:
                text = text.split('```')[1].split('```')[0]
            
            matches = json.loads(text)
            return matches[:10]
            
        except Exception as e:
            print(f"AI matching failed: {e}, falling back to algorithm")
            return self._algorithmic_match(user_id, teaching_skills, 
                                           learning_skills, all_users)

    def _algorithmic_match(self, user_id, teaching_skills, 
                           learning_skills, all_users) -> List[Dict]:
        """Fallback algorithmic matching when Gemini is unavailable"""
        teaching_names = {s['name'].lower() for s in teaching_skills}
        learning_names = {s['name'].lower() for s in learning_skills}
        teaching_categories = {s.get('category', '').lower() for s in teaching_skills}
        learning_categories = {s.get('category', '').lower() for s in learning_skills}
        
        matches = []
        
        for candidate in all_users:
            if candidate.get('userId') == user_id:
                continue
                
            c_teaching = {s['name'].lower() for s in candidate.get('teachingSkills', [])}
            c_learning = {s['name'].lower() for s in candidate.get('learningSkills', [])}
            c_teach_cats = {s.get('category', '').lower() for s in candidate.get('teachingSkills', [])}
            c_learn_cats = {s.get('category', '').lower() for s in candidate.get('learningSkills', [])}
            
            # Direct skill matches
            can_teach_me = c_teaching & learning_names
            i_can_teach = teaching_names & c_learning
            
            # Category overlap
            cat_overlap = (c_teach_cats & learning_categories) | (teaching_categories & c_learn_cats)
            
            if not can_teach_me and not i_can_teach and not cat_overlap:
                continue
            
            # Calculate composite score
            direct_match_score = (len(can_teach_me) + len(i_can_teach)) * 20
            category_score = len(cat_overlap) * 8
            mutual_score = 15 if (can_teach_me and i_can_teach) else 0
            
            total_score = min(direct_match_score + category_score + mutual_score, 99)
            
            if total_score > 0:
                matches.append({
                    'userId': candidate.get('userId', ''),
                    'name': candidate.get('name', 'Unknown'),
                    'score': round(total_score, 1),
                    'matchedSkills': {
                        'canTeachMe': list(can_teach_me),
                        'iCanTeach': list(i_can_teach)
                    },
                    'reasoning': self._generate_reasoning(can_teach_me, i_can_teach, cat_overlap)
                })
        
        matches.sort(key=lambda x: x['score'], reverse=True)
        return matches[:10]

    def _generate_reasoning(self, can_teach_me, i_can_teach, cat_overlap) -> str:
        """Generate human-readable matching reasoning"""
        parts = []
        if can_teach_me:
            parts.append(f"Can teach you: {', '.join(can_teach_me)}")
        if i_can_teach:
            parts.append(f"Wants to learn what you teach: {', '.join(i_can_teach)}")
        if can_teach_me and i_can_teach:
            parts.append("Excellent mutual exchange opportunity!")
        elif cat_overlap:
            parts.append(f"Shared interest in: {', '.join(cat_overlap)}")
        return '. '.join(parts) if parts else 'Potential skill exchange partner'

    def analyze_pair(self, user1: Dict, user2: Dict) -> Dict:
        """Analyze compatibility between two specific users"""
        if self.use_ai:
            try:
                prompt = f"""Analyze the skill exchange compatibility between these two users:

User 1: {json.dumps(user1)}
User 2: {json.dumps(user2)}

Provide a JSON response with:
{{
  "overallScore": 0-100,
  "strengths": ["strength1", "strength2"],
  "gaps": ["gap1"],
  "recommendation": "Short recommendation text",
  "suggestedTopics": ["topic1", "topic2"]
}}

Return ONLY valid JSON."""

                response = self.model.generate_content(prompt)
                text = response.text.strip()
                if '```json' in text:
                    text = text.split('```json')[1].split('```')[0]
                elif '```' in text:
                    text = text.split('```')[1].split('```')[0]
                return json.loads(text)
            except:
                pass
        
        return {
            'overallScore': 75,
            'strengths': ['Complementary skill sets', 'Similar learning goals'],
            'gaps': ['Different experience levels may require patience'],
            'recommendation': 'Good potential for skill exchange',
            'suggestedTopics': ['Start with basics', 'Set clear learning goals']
        }
