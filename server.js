'use strict';

const server = require('express');

const app = server();

const PORT = process.env.PORT || 3500;

app.listen(PORT, () => {
    console.log('I am listening to port',PORT);
});
