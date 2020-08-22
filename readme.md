# moodle3session
moodle3session is a module allowing to obtain a moodle session cookie for moodle3 instances.
With that cookie it is possible to act like a real logged in user.

# Installation
```bash
npm install moodle3session --save
yarn add moodle3session
bower install moodle3session --save
```

# Usage

To get a moodle session you have to create a new `MoodleSession` object...

```js
const moodle3session = require('modle3session');
const session = moodle3Session.MoodleSession('https://moodle.mysite.de');
...

const moodleSession = session.obtainMoodleSession('Username', 'Password'); // string
const stillValid = session.isValid(moodleSession); // boolean
```