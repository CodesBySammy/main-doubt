// script.js

// Function to submit a question to the server
async function submitQuestion(event) {
  event.preventDefault(); // Prevent the default form submission behavior

  // Get the form data
  const formData = new FormData(document.getElementById("question-form"));

  try {
      // Send a POST request to the server with the form data
      const response = await fetch("/submitQuestion", {
          method: "POST",
          body: formData
      });
      
      if (response.ok) {
          // If the server responds successfully, clear the form and update the displayed questions
          document.getElementById("question-form").reset();
          fetchQuestions();
      } else {
          console.error("Failed to submit question:", response.statusText);
      }
  } catch (error) {
      console.error("Error submitting question:", error);
  }
}

// Function to fetch and display recent questions from the serverA
async function fetchQuestions() {
  try {
      // Send a GET request to the server to fetch recent questions
      const response = await fetch("/getQuestions");
      const data = await response.json(); // Parse the response as JSON

      // Update the questions-container with the fetched questions
      const questionsContainer = document.getElementById("questions-container");
      questionsContainer.innerHTML = ""; // Clear previous content

      // Loop through the fetched questions and create HTML elements to display them
      data.forEach(question => {
          const questionElement = document.createElement("div");
          questionElement.classList.add("question");
          questionElement.innerHTML = `<p><strong>Question:</strong> ${question.question}</p>`;
          if (question.image) {
              questionElement.innerHTML += `<img src="${question.image}" alt="Question Image" style="max-width: 100%;">`;
          }
          questionsContainer.appendChild(questionElement);
      });
  } catch (error) {
      console.error("Error fetching questions:", error);
  }
}

// Call fetchQuestions function when the page loads to initially display questions
window.onload = fetchQuestions;
