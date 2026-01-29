¢
import urllib.request
import urllib.parse
import urllib.error
import json

BASE_URL = "http://localhost:8000"

def get_token():
    url = f"{BASE_URL}/auth/token"
    data = urllib.parse.urlencode({
        "username": "admin@synapseplan.com",
        "password": "admin"
    }).encode()
    try:
        req = urllib.request.Request(url, data=data, method="POST")
        with urllib.request.urlopen(req) as response:
            res = json.loads(response.read().decode())
            return res["access_token"]
    except Exception as e:
        print(f"Failed to get token: {e}")
        return None

def test_endpoint(path, token):
    url = f"{BASE_URL}{path}"
    print(f"Testing GET {url}...")
    headers = {"Authorization": f"Bearer {token}"} if token else {}
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req) as response:
            print(f"Status: {response.getcode()}")
            print(f"Body: {response.read().decode()}")
    except urllib.error.HTTPError as e:
        print(f"HTTP Error: {e.code}")
        print(f"Reason: {e.reason}")
        print(f"Body: {e.read().decode()}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    token = get_token()
    if token:
        print("Got token!")
        test_endpoint("/admin/tags/", token)
        test_endpoint("/users/", token)
        # Test task creation failure
        # Need a project id. Let's assume project_id=1 exists
        # POST /projects/1/tasks/
	 *cascade08	*cascade08 *cascade08' *cascade08'<*cascade08<A *cascade08AJ *cascade08JK*cascade08KL *cascade08LN*cascade08Ne *cascade08eh*cascade08hi *cascade08in*cascade08n| *cascade08|ø*cascade08øŠ *cascade08Š‘*cascade08‘È *cascade08ÈË*cascade08ËÜ *cascade08ÜÙ*cascade08Ùç *cascade08çè*cascade08èì *cascade08ìí*cascade08íî *cascade08îó*cascade08óû *cascade08û€*cascade08€ *cascade08‚*cascade08‚„ *cascade08„†*cascade08†‡*cascade08‡‰ *cascade08‰Œ*cascade08ŒŽ *cascade08Ž‘*cascade08‘£ *cascade08£¥*cascade08¥¦ *cascade08¦¯*cascade08¯° *cascade08°±*cascade08±² *cascade08²³*cascade08³» *cascade08»½*cascade08½¾ *cascade08¾Á*cascade08ÁÃ *cascade08ÃÇ*cascade08ÇÞ *cascade08Þß*cascade08ßá *cascade08áâ*cascade08âî *cascade08îð*cascade08ðñ *cascade08ñ÷*cascade08÷û *cascade08ûý*cascade08ý† *cascade08†Œ*cascade08Œ *cascade08Ž*cascade08Ž *cascade08”*cascade08”• *cascade08•—*cascade08—˜ *cascade08˜™*cascade08™š *cascade08š¤*cascade08¤¦ *cascade08¦§*cascade08§¨ *cascade08¨¬*cascade08¬¯ *cascade08¯¶*cascade08¶· *cascade08·¿*cascade08¿À *cascade08ÀÁ*cascade08ÁÂ *cascade08ÂÃ*cascade08ÃÄ *cascade08ÄÈ*cascade08ÈÎ *cascade08ÎÑ*cascade08Ñá *cascade08áâ*cascade08âå *cascade08åæ*cascade08æé *cascade08éñ*cascade08ñô *cascade08ôõ*cascade08õ‡	 *cascade08‡	Š	*cascade08Š	‹	 *cascade08‹		*cascade08	’	 *cascade08’	“	*cascade08“	”	 *cascade08”	£	*cascade08£	ƒ
 *cascade08ƒ
Ì
*cascade08Ì
ç
 *cascade08ç
î
*cascade08î
ñ
 *cascade08ñ
õ
*cascade08õ
 *cascade08—*cascade08—š *cascade08š¢*cascade08"(895d416ae94c3d3f1d10e837bfe2ecc0bfb695382Hfile:///c:/Users/Admin/Documents/Coding/SynapsePlan/backend/debug_api.py:3file:///c:/Users/Admin/Documents/Coding/SynapsePlan