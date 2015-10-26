var text = "";
var questions;
var shuffledQuestions;
var practice = false;
var shuffle = false;
var showAnswers = true;
$(function() {
  		 $.ajax('docs/source.txt',
  		 {
  		 	dataType: "text",
  		 	async: false,
  		 	fail: function(){alert("failed to load file");},
  		 	success: function(data) {	
  				text = data;
  				var array = text.split("\n");
  				questions = prepareQuestionsArray(array);
  		 	}
  		 });
  		 
  		 $("#startExamButton").click(startExam);
  		 $("#previousQuestionButton").click(goToPreviousQuestion);
  		 $("#nextQuestionButton").click(goToNextQuestion);
  		 $("#submitExamButton").click(submitExam);
  		 $("#startPracticeButton").click(startPractice);
  		 $("#markQuestionButton").click(markQuestion);
  		 $("#showAnswersButton").click(toggleShowAnswers);
  		 $("#jumpToQuestionButton").click(jumpToQuestion);
  		 $("#shuffleQuestionsCheckbox").change(function(){
  		 	shuffle = $(this).prop("checked");
  		 	
  		 });
  		 
  		 $("#jumpToQuestionInput").focus(function(){
  		 	$(this).val("");
  		 });
  		 
  		 $(document).keyup(function(e) {
  		 	var code = e.keyCode || e.which;
  		 	switch(code) {
  		 		case 13: case 39: {
  		 			$("#nextQuestionButton:visible").click();
  		 			break;
  		 		} 
  		 		case 37: case 8: {
  		 			$("#previousQuestionButton:visible").click();
  		 			break;
  		 		}
  		 		case 32: {
  		 			$("#markQuestionButton:visible").click();
  		 			break;		 			
  		 		}
  		 		default : break;
  		 	}
  		 });
});

function jumpToQuestion(e) {
  try {
  	var questionIndex = parseInt($("#jumpToQuestionInput").val()) - 1;
  	displayQuestion(questionIndex);
  } catch (ex) {
  	
  }
}

function toggleShowAnswers(e) {
	showAnswers = !showAnswers;
	if (showAnswers) {
		$("#correctAnswersSection").show();
		$(".correctAnswer").addClass("correctAnswerStyle");
	} else {
		$("#correctAnswersSection").hide();
		$(".correctAnswer").removeClass("correctAnswerStyle");
	}
}

function markQuestion(e){
	var questionIndex = $("#questionsSection").attr("question-index");
	questionIndex = parseInt(questionIndex);
	var $button = $(".markedQuestionButton[question-index='" + questionIndex + "']");
	if ($button.length > 0) {
		$button.remove();
	} else {
		$button = $("<button question-index='" + questionIndex + "' class='markedQuestionButton'>" + (questionIndex+1) + "</button>");
		$("#markedQuestionsSection").append($button);
		$button.click(goToWrongQuestion);
	}
	if ($(".markedQuestionButton").length > 0) {
		$("#markedQuestionsSectionHeader").show();
	} else {
		$("#markedQuestionsSectionHeader").hide();
	}
	
}

function submitExam(e) {
	if (confirm("Are you sure you want to submit? There's no way back!")) {
		var wrongQuestionsIndicesArray = [];
		$(shuffledQuestions).each(function(i,question) {
			var chosenAnswersArray = question.chosenAnswers || [];
			var chosenAnswersStr = chosenAnswersArray.join(",");
			
	
			var correctAnswersStr = getCorrectAnswersAsString(question,",");
	
			if (correctAnswersStr != chosenAnswersStr) {
				wrongQuestionsIndicesArray.push(i);		
			}
		});
		$("#wrongAnswersSection").show();
		$("#correctAnswersSection").show();
		$("#markQuestionButton").hide();
		displaywrongQuestionsIndices(wrongQuestionsIndicesArray);	
		displayQuestion(0);
	}
}

function displaywrongQuestionsIndices(wrongQuestionsIndicesArray) {
	$("#submitExamButton").hide();
	$("#wrongQuestionsSection").show();
	$("#wrongQuestionsSection").text("Wrong answered questions: ");
	
	$(wrongQuestionsIndicesArray).each(function(i,wrongQuestionIndex){
		var $wrongQuestionLine = $("<button class='wrongQuestionLine'>" + (parseInt(wrongQuestionIndex)+1) + "</button>");
		$wrongQuestionLine.attr("question-index",wrongQuestionIndex);
		$("#wrongQuestionsSection").append($wrongQuestionLine);
	});
	
	$(".wrongQuestionLine").click(goToWrongQuestion);
}

function goToWrongQuestion(e) {
	var questionIndex = $(this).attr("question-index");
	var question = shuffledQuestions[questionIndex];
	// var correctAnswersString = getCorrectAnswersAsString(question,", ");
	// var chosenAnswersArray = question.chosenAnswers || [];
	// var chosenAnswersString = chosenAnswersArray.join(", ");
	// $("#wrongAnswersSection").append("<p>Correct answers: " + correctAnswersString + "</p>");
	// $("#wrongAnswersSection").append("<p>Your answers: " + chosenAnswersString + "</p>");
	// $("#wrongAnswersSection").show();
	displayQuestion(questionIndex);
	$("html, body").animate({ scrollTop: 0 }, "slow");
}

function getCorrectAnswersAsString(question,delimiter,showLetter) {
	var answersArray = question.answersArray || [];
	var correctAnswersArray = [];
	$(answersArray).each(function(j,answer){
		if (answer.correct) {
			if (showLetter) {
				// var letterCode = j + "a".charCodeAt(0);
				var letter = turnNumberToLetter(j);
				correctAnswersArray.push(letter);				
			} else {
				correctAnswersArray.push(j);
			}
		}
	});
	return correctAnswersArray.join(delimiter);
}

function turnNumberToLetter(number) {
	var letterCode = parseInt(number) + "a".charCodeAt(0);
	return String.fromCharCode(letterCode);
}

function goToPreviousQuestion(e) {
	var index = $("#questionsSection").attr("question-index");
	--index;
	displayQuestion(index);
}

function goToNextQuestion(e) {
  	var index = $("#questionsSection").attr("question-index");
  	++index;
  	displayQuestion(index);
}

function onAnswerChange(e) {
	var index = $("#questionsSection").attr("question-index");
	var question = shuffledQuestions[index];
	var chosenAnswers = [];
	$("input[name=answers]:checked").each(function(i,answerElement){
		var answerIndex = $(answerElement).attr("answer-index");
		chosenAnswers.push(answerIndex);
	});
	question.chosenAnswers = chosenAnswers;
}

function startPractice(e) {
	$("#submitExamButton").hide();
	$("#correctAnswersSection").show();
	$("#showAnswersSection").show();
	practice = true;
	startExam();
}

function startExam() {
	$("#startExamButton").hide();
	$("#startPracticeButton").hide();
	$("#shuffleQuestionsDiv").hide();
	$("#questionsSection").show();
	if (shuffle) {
		shuffledQuestions = shuffleArray(questions);
	} else {
		shuffledQuestions = questions;
	}
	displayQuestion(0);
	
}

function displayQuestion(index) {
	if (index == 0) {
		$("#previousQuestionButton").hide();
	} else {
		$("#previousQuestionButton").show();
	} 
	
	if (index == shuffledQuestions.length-1) {	//last question - no need to show the next button
		$("#nextQuestionButton").hide();
	} else {
		$("#nextQuestionButton").show();
	}
	
	var question = shuffledQuestions[index];
	var questionBody = question.questionBody;
	var multiple = question.multipleAnswers;
	// $("#questionBodySection").text((parseInt(index)+1) + "(" + question.originalIndex + "). " + questionBody);
		$("#questionBodySection").text((parseInt(index)+1) + ". " + questionBody);
	$("#questionsSection").attr("question-index",index);
	createAnswersLayout(question,multiple);
	var correctAnswersStr = getCorrectAnswersAsString(question,", ",true);
	$("#correctAnswersSection").text("Answers: " + correctAnswersStr);
	var wrongAnswersArr = question.chosenAnswers || [];
	var wrongAnswersLetterArr = [];
	$(wrongAnswersArr).each(function(i,number){
		wrongAnswersLetterArr.push(turnNumberToLetter(number));
	});
	var wrongAnswerStr = wrongAnswersLetterArr.join(", ");
	$("#wrongAnswersSection").text("Your answers: " + wrongAnswerStr);
	
}

function createAnswersLayout(question,multiple) {
	var answers = question.answersArray;
	$("#answersSection").text("");
	var type = multiple ? "checkbox" : "radio";
	$(answers).each(function(i,answer){
		var answerBody = answer.body;
		var answerId = "answer" + i;
		var $answerElement = $("<input name='answers' />");
		$answerElement.attr("type",type);
		$answerElement.attr("id",answerId);
		var answerIndexLetterCode = i + "a".charCodeAt(0);
		var answerIndexLetter = String.fromCharCode(answerIndexLetterCode);
		var $label = $("<label>" + answerIndexLetter + ". " + answerBody + "</label>");
		$label.attr("for",answerId);
		if (practice && answer.correct) {
			if (showAnswers) {
				$label.addClass("correctAnswerStyle");
			}
			$label.addClass("correctAnswer");
		}
		$answerElement.attr("answer-index",i);
		$("#answersSection").append($answerElement);
		$("#answersSection").append($label);
		$("#answersSection").append("<br/>");
	});
	$("[name='answers']").on("change",onAnswerChange);
	var chosenAnswers = question.chosenAnswers || [];
	var $answersElements = $("[name='answers']");
	$(chosenAnswers).each(function(i,chosenIndex){
		$($answersElements[chosenIndex]).prop("checked",true);
	});
}


String.prototype.startsWith = function (str){
    return this.indexOf(str) === 0;
};

function prepareQuestionsArray(arr) {
	var i=0;
	var questionsArray = [];
	while (i < arr.length) {
		try {
			var line = arr[i].trim();
			if (line == "") {
				++i;
				continue;
			}
			// var question = "";
			var originalIndex = getQuestionOriginalIndex(line);
			var question = sliceAnswerOrQuestionIndex(line);
			++i;
			line = arr[i].trim();
			while (!line.toLowerCase().startsWith("a.")) {
				if (line != "") {
					question += "\n" + line;
				}
				++i;
				line = arr[i].trim();
			}
			question = question.trim();
			var answers = [];
			while (!line.startsWith("Ans")) {
				line = sliceAnswerOrQuestionIndex(line).trim();
				if (line != "") {
					var answer = new Answer(line,false);
					answers.push(answer);
				}
				++i;
				line = arr[i].trim();
				
			}
			var correctLine = line.split(":");
			var correctAnswersStr = correctLine[1].trim();
			var correctAnswersArray = correctAnswersStr.split(",");
			var multipleAnswers = correctAnswersArray.length > 1;
			$(correctAnswersArray).each(function(i,correcIndexStr){
				correcIndexStr = correcIndexStr.trim();
				var index = correcIndexStr.toLowerCase().charCodeAt(0) - "a".charCodeAt(0);
				answers[index].correct = true;
			});
			if (shuffle) {
				answers = shuffleArray(answers);	
			}
			
			var question = new Question(question,answers,multipleAnswers,originalIndex);
			questionsArray.push(question);
			++i;
		} catch (e) {
			console.log("error at "+i);
		}
	}

	console.log(questionsArray);
	return questionsArray;
}

function Answer(body,correct) {
	this.body = body;
	this.correct = correct;
} 

function Question(questionBody,answersArray,multipleAnswers,originalIndex) {
	this.questionBody = questionBody;
	this.answersArray = answersArray;
	this.multipleAnswers = multipleAnswers;
	this.originalIndex = originalIndex;
}

function sliceAnswerOrQuestionIndex(str) {
	var lineSplitted = str.split(".");
	var lineSliced = lineSplitted.slice(1,lineSplitted.length);
	return lineSliced.join(".");
}

function getQuestionOriginalIndex(str) {
	var lineSplitted = str.split(".");
	return lineSplitted[0].trim();
}

function shuffleArray(o){ 
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
};

