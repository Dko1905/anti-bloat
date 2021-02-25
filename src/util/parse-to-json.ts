import {HTMLElement} from 'node-html-parser'

const decodeHTML = function(str: string) {
    var map = {"gt":">" /* , … */};
    return str.replace(/&(#(?:x[0-9a-f]+|\d+)|[a-z]+);?/gi, function($0, $1) {
        if ($1[0] === "#") {
            return String.fromCharCode($1[1].toLowerCase() === "x" ? parseInt($1.substr(2), 16)  : parseInt($1.substr(1), 10));
        } else {
            return map.hasOwnProperty($1) ? map[$1] : $0;
        }
    });
};

export function parseToJson(root_elm: HTMLElement) {
	// This root is used in the content of the article
	const root = root_elm.querySelector("#article__header--project_1-0")!!
	// Create the view
	let view: {
		doc_title: string,
		doc_subtitle: string,
		doc_content: {
			type: 'p' | 'img' | 'h2' | 'list',
			p_content?: string,
			h2_content?: string,

			img_src?: string,
			img_alt?: string,

			list_isalist?: string,
			list_children?: {
				content: string
			}[]
		}[]
	} = {
		doc_title: '',
		doc_subtitle: '',
		doc_content: []
	}
	view.doc_title = decodeHTML((<HTMLElement>root_elm.querySelector('.heading__title')).innerText.trim())
	view.doc_subtitle = decodeHTML((<HTMLElement>root_elm.querySelector('.heading__subtitle')).innerText.trim())

	for (const elm of root.childNodes) {
		if (elm.nodeType == 1) { // ELEMENT_NODE
			// If paragraph
			if ((elm as any).rawTagName == 'p') {
				if ((<HTMLElement>elm).innerText != '') {
					view.doc_content.push({
						type: 'p',
						p_content: decodeHTML((<HTMLElement>elm).innerText.trim()),
					})
				}
			} else if ((elm as any).rawTagName == 'figure') {
				const elm_html = <HTMLElement><unknown>elm
				const img = elm_html.querySelector('img')
				console.log(img)
				if (img != null) {
					view.doc_content.push({
						type: 'img',
						img_src: img.getAttribute('data-src')!!,
						img_alt: img.getAttribute('alt')!!
					})
				} else {
					console.info('Didn\'t find image data')
				}
			} else if ((elm as any).rawTagName == 'h2') {
				if ((<HTMLElement>elm).innerText != '') {
					view.doc_content.push({
						type: 'h2',
						h2_content: decodeHTML((<HTMLElement>elm).innerText.trim()),
					})
				}
			} else if ((elm as any).rawTagName == 'ul') {
				const elm_html = <HTMLElement><unknown>elm
				let children: { content: string }[] = []
				for (const li of elm_html.querySelectorAll('li')) {
					children.push({ content: decodeHTML(li.innerText.trim()) })
				}
				view.doc_content.push({
					type: 'list',
					list_isalist: 'yes',
					list_children: children
				})
			}
		}
	}

	return view
}
