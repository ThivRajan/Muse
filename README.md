# Muse - AI Cover Letters in One Click

## Getting Started

1. Run `npm install`.
2. Add `.env` file and add one of the following environment variables:
   - If you have an API key for OpenAI and wish to use it, add `VITE_OPENAI_API_KEY=<API-KEY>`
   - If you have your own endpoint that generates the cover letter, add `VITE_CUSTOM_COVER_LETTER_ENDPOINT=<ENDPOINT>`
3. Run `npm build-dev` to continuously keep building the extension on any changes.
4. Open Google Chrome and go to [chrome://extensions](chrome://extensions).
5. Press "Load unpacked" and then choose the `dist` folder (it will be generated from step #2).
6. To see any changes that you make, you simply need to close and re-open the extension (by clicking the extension icon).

- Note that to see changes made to the `.env` file or the files in the `public` folder, you will need to stop the build and repeat steps #3-5.
