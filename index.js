require('dotenv').config();
const cron = require('node-cron');
const express = require('express');
const app = express();
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const KAHOOT_USERNAME = process.env.KAHOOT_USERNAME;
const KAHOOT_PASSWORD = process.env.KAHOOT_PASSWORD;

async function getKahootToken() {
    // Kahootのトークン取得エンドポイントを呼び出すロジック
    // 非公式APIのため、具体的なURLはご自身で調査してください。
    try {
        const response = await fetch('https://kahoot.it/rest/users/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: KAHOOT_USERNAME,
                password: KAHOOT_PASSWORD
            })
        });
        const data = await response.json();
        return data.token; // トークンを返す
    } catch (error) {
        console.error('Failed to get token:', error);
        return null;
    }
}

async function createNewCourse() {
    const token = await getKahootToken();
    if (!token) {
        console.error('Failed to create course: No token available.');
        return;
    }

    // Kahootのコース作成エンドポイントを呼び出すロジック
    // ここでも、非公式APIのURLを調査して実装してください。
    try {
        const response = await fetch('https://kahoot.it/rest/kahoots', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({
                // コース作成に必要なペイロード
                // (例: 'title': 'New Course', 'questions': [...])
            })
        });
        const data = await response.json();
        console.log('New course created:', data);
    } catch (error) {
        console.error('Failed to create course:', error);
    }
}

// 毎日午前0時にタスクを実行
cron.schedule('0 0 * * *', () => {
    console.log('Running scheduled task: Creating a new Kahoot course.');
    createNewCourse();
}, {
    timezone: "Asia/Tokyo" // タイムゾーンを日本時間に設定
});

// Renderがサービスを起動するために必要なエンドポイント
app.get('/', (req, res) => {
    res.send('Kahoot Course Creator is running.');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
