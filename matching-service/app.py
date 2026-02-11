from flask import Flask, request, jsonify
from flask_cors import CORS
from matcher import SkillMatcher
import os

app = Flask(__name__)
CORS(app)

matcher = SkillMatcher()

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'OK',
        'service': 'SkillSwap Matching Service',
        'engine': 'Gemini AI'
    })

@app.route('/match', methods=['POST'])
def find_matches():
    """Find skill matches for a user using Gemini AI"""
    try:
        data = request.json
        user_id = data.get('userId')
        user_name = data.get('userName', '')
        teaching_skills = data.get('teachingSkills', [])
        learning_skills = data.get('learningSkills', [])
        availability = data.get('availability', {})
        all_users = data.get('allUsers', [])

        matches = matcher.find_matches(
            user_id=user_id,
            user_name=user_name,
            teaching_skills=teaching_skills,
            learning_skills=learning_skills,
            availability=availability,
            all_users=all_users
        )

        return jsonify({
            'success': True,
            'matches': matches,
            'algorithm': 'gemini-ai',
            'totalCandidates': len(all_users),
            'matchesFound': len(matches)
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/analyze', methods=['POST'])
def analyze_compatibility():
    """Analyze compatibility between two users"""
    try:
        data = request.json
        user1 = data.get('user1', {})
        user2 = data.get('user2', {})

        analysis = matcher.analyze_pair(user1, user2)
        return jsonify({'success': True, 'analysis': analysis})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    print(f"\n🧠 SkillSwap Matching Service running on http://localhost:{port}")
    print(f"🤖 Using Gemini AI for intelligent matching\n")
    app.run(host='0.0.0.0', port=port, debug=True)
