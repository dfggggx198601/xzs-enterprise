const fs = require('fs');
const path = require('path');

async function tryLogin(url, username, password) {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userName: username,
        password: password
      })
    });
    const data = await res.json();
    if (data.code === 1) {
      console.log(`Success [${url}] with ${username}:${password}`);
      const cookie = res.headers.get('set-cookie');
      return { token: data.response, cookie };
    } else {
      console.log(`Failed [${url}] with ${username}:${password} - Code: ${data.code}, Msg: ${data.message}`);
    }
  } catch (e) {
    console.log(`Error [${url}] with ${username}:${password} - ${e.message}`);
  }
  return null;
}

async function fetchPage(headers, pageIndex, pageSize) {
  const res = await fetch('http://150.230.123.72:8000/api/admin/question/page', {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ pageIndex, pageSize })
  });
  if (!res.ok) {
    throw new Error(`HTTP status ${res.status}`);
  }
  const data = await res.json();
  if (data.code !== 1) {
    throw new Error(`API error: ${data.message}`);
  }
  return data.response.list;
}

async function fetchDetail(headers, id) {
  const res = await fetch(`http://150.230.123.72:8000/api/admin/question/select/${id}`, {
    method: 'POST',
    headers
  });
  if (!res.ok) {
    throw new Error(`HTTP status ${res.status}`);
  }
  const data = await res.json();
  if (data.code !== 1) {
    throw new Error(`API error: ${data.message}`);
  }
  return data.response;
}

async function run() {
  const credentials = [
    { url: 'http://150.230.123.72:8000/api/user/login', u: 'admin', p: '123456' }
  ];

  let auth = await tryLogin(credentials[0].url, credentials[0].u, credentials[0].p);
  if (!auth) {
    console.log('Could not log in as admin.');
    return;
  }

  const headers = {};
  if (auth.cookie) {
    headers['Cookie'] = auth.cookie;
  }
  if (auth.token) {
    headers['Authorization'] = `Bearer ${auth.token}`;
  }

  const detailedQuestions = [];
  const seenIds = new Set();
  const chunkSize = 50;
  let chunkIndex = 1;
  let finished = false;

  console.log('Starting duplicate-safe adaptive chunked crawler...');

  while (!finished) {
    console.log(`Requesting chunk ${chunkIndex} (pageSize: ${chunkSize})...`);
    try {
      const list = await fetchPage(headers, chunkIndex, chunkSize);
      if (!list || list.length === 0) {
        console.log(`Chunk ${chunkIndex} returned 0 results. Finished.`);
        finished = true;
        break;
      }

      console.log(`Chunk ${chunkIndex} succeeded. Processing ${list.length} questions...`);
      for (const q of list) {
        if (seenIds.has(q.id)) {
          console.log(`Detected duplicate ID ${q.id} in chunk. Reached end of database.`);
          finished = true;
          break;
        }
        seenIds.add(q.id);

        try {
          const detail = await fetchDetail(headers, q.id);
          detailedQuestions.push(detail);
          console.log(`Fetched Question ID: ${q.id} (Type: ${q.questionType})`);
        } catch (detailErr) {
          console.log(`Error fetching detail for ID ${q.id}: ${detailErr.message}`);
        }
      }

      if (finished) break;

      if (list.length < chunkSize) {
        console.log('Last chunk reached.');
        finished = true;
      }
    } catch (chunkErr) {
      console.log(`Chunk ${chunkIndex} failed: ${chunkErr.message}. Falling back to single-item querying for this range.`);
      const startIndex = (chunkIndex - 1) * chunkSize + 1;
      const endIndex = chunkIndex * chunkSize;

      for (let i = startIndex; i <= endIndex; i++) {
        try {
          const singleList = await fetchPage(headers, i, 1);
          if (!singleList || singleList.length === 0) {
            console.log('Fallback returned empty list. Finished.');
            finished = true;
            break;
          }
          const q = singleList[0];
          if (seenIds.has(q.id)) {
            console.log(`Detected duplicate ID ${q.id} in fallback. Reached end of database.`);
            finished = true;
            break;
          }
          seenIds.add(q.id);

          try {
            const detail = await fetchDetail(headers, q.id);
            detailedQuestions.push(detail);
            console.log(`[Fallback] Fetched Question ID: ${q.id} (Type: ${q.questionType})`);
          } catch (detailErr) {
            console.log(`[Fallback] Error fetching detail for ID ${q.id}: ${detailErr.message}`);
          }
        } catch (singleErr) {
          console.log(`[Fallback] Item index ${i} failed: ${singleErr.message}`);
        }
      }
    }
    chunkIndex++;
  }

  console.log(`Total questions retrieved: ${detailedQuestions.length}`);
  
  const outputPath = path.join(__dirname, 'questions.json');
  fs.writeFileSync(outputPath, JSON.stringify(detailedQuestions, null, 2), 'utf8');
  console.log(`Questions saved to ${outputPath}`);
}

run();
