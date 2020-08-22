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
const moodle3session = require('moodle3session');
const session = new moodle3session.MoodleSession('https://moodle.mysite.de');
...

const moodleSession = await session.obtainMoodleSession('Username', 'Password'); // string
const stillValid = await session.isValid(moodleSession); // boolean
```