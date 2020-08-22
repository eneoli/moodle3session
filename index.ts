import {URLSearchParams, resolve} from 'url';
import axios from 'axios';
import cheerio from 'cheerio';

export class MoodleSession {

  private moodleUrl: string;

  constructor(moodleUrl: string) {
    if (moodleUrl.charAt(moodleUrl.length - 1) !== '/') {
      this.moodleUrl = moodleUrl + '/';
    } else {
      this.moodleUrl = moodleUrl;
    }
  }


  private extractMoodleSessionCookie(headers: { 'set-cookie': [string] }) {
    return headers['set-cookie'][0].replace('MoodleSession=', '').split(';')[0]
  }

  private async getFreshSession() {
    console.log(this.moodleUrl);
    console.log(resolve(this.moodleUrl, 'login/index.php'));
    const loginResponse = await axios.get(resolve(this.moodleUrl, 'login/index.php'));
    const moodleSession = this.extractMoodleSessionCookie(loginResponse.headers);
    const logintoken = cheerio.load(loginResponse.data)('input[name="logintoken"]').first().val();
    return [moodleSession, logintoken];
  }

  public async obtainMoodleSession(username: string, password: string) {
    let freshSession: string;
    let logintoken: string;
    [freshSession, logintoken] = await this.getFreshSession();

    // build login query
    const params = new URLSearchParams();
    params.append('username', username);
    params.append('password', password);
    params.append('logintoken', logintoken);
    params.append('anchor', '');

    const firstResponse = await axios.post(resolve(this.moodleUrl, 'login/index.php'), params.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Cookie: 'MoodleSession=' + freshSession,
      },
      maxRedirects: 0,
      withCredentials: true,
      validateStatus: () => true, // axios thinks HTTP 303 is an error --> its not!
    });

    const cookieTestUrl = firstResponse.headers.location;

    if (cookieTestUrl === resolve(this.moodleUrl, 'login/index.php')) {
      throw new Error('Username or password wrong');
    }

    // moodle changes session on post request
    const finalSession = this.extractMoodleSessionCookie(firstResponse.headers);

    // moodle checks if session valid
    await axios.get(cookieTestUrl, {
      headers: {
        Cookie: 'MoodleSession=' + finalSession,
      }
    });

    return finalSession;
  }

  public async isValid(moodleSession: string): Promise<boolean> {
    const response = await axios.get(resolve(this.moodleUrl, 'my'), {
      headers: {
        Cookie: 'MoodleSession=' + moodleSession,
      },
      maxRedirects: 0,
      validateStatus: () => true, // axios thinks HTTP 303 is an error --> its not!
    });

    return response.headers.location !== resolve(this.moodleUrl, 'login/index.php');
  }
}