import { response } from "express"

console.log('yo')
// fetch('https://6f26-72-139-192-54.ngrok-free.app/db/webhook', {
fetch('http://localhost:8080/db/webhook', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({ test: 'test'})
})
// .then(()=> console.log(response))
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
    })
    .catch(error => {
        console.error('Error:', error);
    });