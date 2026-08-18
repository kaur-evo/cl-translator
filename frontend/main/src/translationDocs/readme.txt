## General workflow example
* run pnpm i in evocon-cli project folder
* make sure you are logged in to AWS CLI to access OpenAI api key needed to generate suggestions

* Generate phrases ```pnpm run cli generate-phrases```
* Review thoses phrases in phrases.json file, add description, single translation to match that in en.json or use translate --source-translation-from-phrase and mark phrase reviewed by marking requiresManualReview: false which enables automatic translation for that phrase
* Generate translations ```pnpm run cli translate```
* Generate suggestion ```pnpm run cli review-translations```
* Review LLM generated suggestions and remove the ones not needed
* Apply suggestions ```pnpm run cli apply-suggestions```