from urllib.parse import urlencode


def oauth_login():
    base_url = 'https://api.intra.42.fr/oauth/authorize'
    params = {
        'client_id': "u-s4t2ud-3f8d76fb565ae2c8b49b3e5a004b06c8508fc22af3ef603d001f7adce5e277e1",
        'redirect_uri': "http://www.google.com",
        'response_type': 'code',
        'scope': 'public',
    }
    url = f"{base_url}?{urlencode(params)}"
    print(f'Final url from oauth_login: {url}')

oauth_login()