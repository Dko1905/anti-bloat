import express from 'express'
import fetch from 'node-fetch'
import {parse} from 'node-html-parser'
import {promisify} from 'util'
import {readFile} from 'fs'
const readFileAsync = promisify(readFile)
import {render} from 'mustache'

import {parseToJson} from './util/parse-to-json'

/* Constants */
const PORT = Number.parseInt(process.env.PORT || '8080')
const PAGE_TEMPALTE = readFileAsync('static/page.mustache', {encoding: 'utf8'})

const app = express()

app.get("/page/:name", (req: express.Request, res: express.Response) => {
	const page_name: string = req.params.name || ''
	const start = Date.now()

	fetch(`https://www.simplyrecipes.com/recipes/${page_name}`)
		.then(res => res.text())
		.then(async body => {
			try {
				// Parse body, options make it faster
				const parsed_document = parse(body, {
					comment: false,
					lowerCaseTagName: true,
					blockTextElements: {
						script: false,
						noscript: false,
						style: false
					}
				})

				const view = parseToJson(parsed_document)
				const rendered = render(await PAGE_TEMPALTE, view)

				console.info(`Took ${Date.now() - start} ms to render /page/${page_name}`)
				res.type('html').end(rendered)
			} catch (err) {
				console.error(`Caught error: ${err}`)
				res.type('text').status(500).end(`KO: ${err}`)
			}
		})
		.catch(err => {
			console.error(`Caught error: ${err}`)
			res.type('text').status(500).end(`KO: ${err}`)
		})
})

app.listen(PORT, () => {
	console.log(`Listening on http://[::1]:${PORT}`)
})
