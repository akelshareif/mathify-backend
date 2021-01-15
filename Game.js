/** Class with methods that perform game operations
 * Game will only use whole non-negative numbers
 * Answers to division operations will be a whole number and a remainder
 * Each complete game will have 3 rounds
 * Each round's number of questions will be determined by the set difficulty
 */

const _ = require('lodash');
const UserModel = require('./models/User');
const GameModel = require('./models/Game');

class Game {
    static difficultyConfig = {
        easy: {
            duration: 100,
            range: _.range(1, 15),
            choicesPerQuestion: 3,
            totalQuestions: 10,
        },
        medium: {
            duration: 75,
            range: _.range(1, 20),
            choicesPerQuestion: 4,
            totalQuestions: 15,
        },
        hard: {
            duration: 60,
            range: _.range(1, 25),
            choicesPerQuestion: 5,
            totalQuestions: 20,
        },
    };

    // Creates and returns object of a game question and choices
    static createQuestion(difficulty, gameType) {
        // Select game configuration from difficultyConfig object
        const gameConfig = this.difficultyConfig[difficulty];

        // Object that will hold data for a single question
        const questionAndChoices = {
            question: undefined,
            choices: _.sampleSize(gameConfig.range, gameConfig.choicesPerQuestion),
        };

        // Pair of numbers that will compute to the question number
        const [num1, num2] = _.sampleSize(questionAndChoices.choices, 2);

        // Compute question number based on num1, num2, and selected gameType
        switch (gameType) {
            case 'add':
                questionAndChoices.question = [num1 + num2];
                break;

            case 'subtract':
                if (num1 >= num2) {
                    questionAndChoices.question = [num1 - num2];
                } else {
                    questionAndChoices.question = [num2 - num1];
                }
                break;

            case 'multiply':
                questionAndChoices.question = [num1 * num2];
                break;

            // Get whole quotient and remainder
            case 'divide':
                if (num1 >= num2) {
                    const quotient = Math.floor(num1 / num2);
                    const remainder = num1 % num2;
                    questionAndChoices.question = [quotient, remainder];
                } else {
                    const quotient = Math.floor(num2 / num1);
                    const remainder = num2 % num1;
                    questionAndChoices.question = [quotient, remainder];
                }
                break;
        }

        // return object containing answer and array of choices
        return questionAndChoices;
    }

    // Creates and returns array of with all questions and choices
    static createQuestionsArr(difficulty, gameType) {
        // Select game configuration from difficultyConfig object
        const gameConfig = this.difficultyConfig[difficulty];

        // Array will have all questions and their respective choices
        const gameData = [];

        // Create question+choices and add to gameData array
        for (let k = 0; k < gameConfig.totalQuestions; k++) {
            const questionAndChoices = this.createQuestion(difficulty, gameType);
            gameData.push(questionAndChoices);
        }

        return { gameData, duration: gameConfig.duration };
    }

    // Check if answer is right/wrong
    static isCorrectAnswer(gameType, ans1, ans2, question) {
        // Destructure number from question array
        const [questionNum] = question;

        switch (gameType) {
            case 'add':
                if (ans1 + ans2 === questionNum) {
                    return true;
                } else {
                    return false;
                }

            case 'subtract':
                if (ans1 - ans2 === questionNum) {
                    return true;
                } else if (ans2 - ans1 === questionNum) {
                    return true;
                } else {
                    return false;
                }

            case 'multiply':
                if (ans1 * ans2 === questionNum) {
                    return true;
                } else {
                    return false;
                }

            case 'divide':
                // Destructure quotient and remainder from question
                const [quotientQues, remainderQues] = question;

                if (ans1 >= ans2) {
                    const quotientAns = Math.floor(ans1 / ans2);
                    const remainderAns = ans1 % ans2;
                    if (quotientQues === quotientAns && remainderQues === remainderAns) {
                        return true;
                    } else {
                        return false;
                    }
                } else {
                    const quotientAns = Math.floor(ans2 / ans1);
                    const remainderAns = ans2 % ans1;
                    if (quotientQues === quotientAns && remainderQues === remainderAns) {
                        return true;
                    } else {
                        return false;
                    }
                }
        }
    }

    // Check if score is a new high score
    static async isNewHighScore(gameID, currentScore, username) {
        // Find user and current game by ID
        const user = await UserModel.findOne({ username });
        const currentGame = await GameModel.findById(gameID);

        // Update final game score in db
        currentGame.score = currentScore;
        await currentGame.save();

        // Get saved highScore from user with current gameType
        const prevHighScore = user.highScores[currentGame.gameType][currentGame.difficulty];

        // Check if currentScore is greater that saved highScore for current gameType
        if (prevHighScore === undefined || currentGame.score > prevHighScore) {
            // Save new high score to db and return true;
            user.highScores[currentGame.gameType][currentGame.difficulty] = currentGame.score;
            user.markModified('highScores');
            await user.save();
            return true;
        } else {
            // Not a new high score
            return false;
        }
    }

    static async getLeaderboard(gameType, difficulty) {
        // Get all highScores and userID/username for all users
        const allHighScores = await UserModel.find({}, 'username highScores');

        // Filter allHighScores to a new array with userIDs and specified gameType highscores
        const gameTypeHighScores = allHighScores
            .map(({ username, highScores }) => {
                if (highScores[gameType][difficulty]) {
                    return {
                        username,
                        highScore: highScores[gameType][difficulty],
                    };
                }
            })
            .filter((userData) => userData != null);

        // Sort scores by score first then userID/username and reverse to get descending order
        const sortedHighScores = _.sortBy(gameTypeHighScores, ['highScore', 'username']).reverse();

        // Grab the top 5 high scores
        const topFiveScores = sortedHighScores.slice(0, 5);

        return topFiveScores;
    }

    // Creates new game and saves to db
    static async createGame(difficulty, gameType, username) {
        // Create a new game
        const { gameData, duration } = this.createQuestionsArr(difficulty, gameType);

        // Save new game to db
        const newGameData = await GameModel.create({
            difficulty,
            gameType,
            duration,
            questionsAnswers: gameData,
        });

        // Add gameID to user's gamesPlayed in db
        const user = await UserModel.findOne({ username });
        user.gamesPlayed.push(newGameData._id);
        await user.save();

        return newGameData;
    }
}

module.exports = Game;
