/**
 * Sanitizes a string to prevent XSS attacks
 * @param {string} str - The string to sanitize
 * @returns {string} The sanitized string
 */
function sanitizeHTML(str) {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
}

/**
 * Converts markdown syntax to HTML
 * @param {string} markdown - The markdown string to convert
 * @returns {string} The resulting HTML
 */
export function markdownToHTML(markdown) {
    if (!markdown) return '';
    
    let html = markdown;
    
    // Preserve line breaks for processing
    html = html.replace(/\r\n/g, '\n');
    
    // Process code blocks FIRST, before any other markdown processing
    // This will convert them to HTML elements that won't be affected by subsequent processing
    html = html.replace(/```(.*?)\n([\s\S]*?)```/g, function(match, language, code) {
        // Trim trailing newlines from code
        code = code.replace(/\n+$/, '');
        
        // Sanitize the code - this prevents HTML injection but preserves the original formatting
        const sanitizedCode = sanitizeHTML(code);
        
        // Create the HTML structure for the code block immediately
        return `<div class="code-block">
                  <div class="code-header">
                    <span class="code-language">${language.trim() || 'code'}</span>
                    <div class="code-actions">
                      <button class="code-copy-btn" aria-label="Copy code">Copy</button>
                    </div>
                  </div>
                  <pre><code class="language-${language.trim() || 'plaintext'}">${sanitizedCode}</code></pre>
                </div>`;
    });
    
    // Now process the rest of the markdown, which will exclude the already-processed code blocks
    
    // Process tables
    html = processMarkdownTables(html);
    
    // Convert inline code (but not inside already converted code blocks)
    html = html.replace(/(`+)(?!<\/code>)(.*?)(?!\<code)((`+))/g, function(match, start, content) {
        if (start.length === 1) {
            return '<code class="inline-code">' + sanitizeHTML(content) + '</code>';
        }
        return match; // Return as is if not single backtick
    });
    
    // Convert headers with Perplexity-style classes
    html = html.replace(/^#{1,6}\s+(.*)$/gm, function(match) {
        const level = match.trim().indexOf(' ');
        const text = match.substring(level + 1).trim();
        return `<h${level} class="px-header px-h${level}">${text}</h${level}>`;
    });
    
    // Convert bold and italic
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="px-bold">$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em class="px-italic">$1</em>');
    html = html.replace(/\_\_(.*?)\_\_/g, '<strong class="px-bold">$1</strong>');
    html = html.replace(/\_(.*?)\_/g, '<em class="px-italic">$1</em>');
    
    // Process lists
    html = processUnorderedLists(html);
    html = processOrderedLists(html);
    
    // Convert horizontal rules
    html = html.replace(/^(\s*[-*_]){3,}\s*$/gm, '<hr class="px-hr">');
    
    // Convert links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="px-link" target="_blank" rel="noopener noreferrer">$1</a>');
    
    // Handle blockquotes
    html = processBlockquotes(html);
    
    // Convert paragraphs
    html = processParagraphs(html);
    
    // Clean up extra line breaks
    html = html.replace(/\n{2,}/g, '\n');
    
    // Clean up empty paragraphs
    html = html.replace(/<p[^>]*>\s*<\/p>/g, '');
    
    // Wrap the entire content in a container
    html = `<div class="px-content">${html.trim()}</div>`;
    
    return html;
}

/**
 * Process markdown tables
 * @param {string} html - The HTML content to process
 * @returns {string} Processed HTML with tables
 */
function processMarkdownTables(html) {
    // This regex finds markdown tables
    const tableRegex = /(\|[^\n]+\|\r?\n)((?:\|:?[-]+:?)+\|)(\n(?:\|[^\n]+\|\r?\n?)*)/g;
    
    return html.replace(tableRegex, function(match, headerRow, delimiterRow, bodyRows) {
        // Process header
        const headers = headerRow.trim().split('|').slice(1, -1).map(
            cell => `<th>${cell.trim()}</th>`
        ).join('');
        
        // Process alignment from delimiter row
        const alignments = delimiterRow.trim().split('|').slice(1, -1).map(delim => {
            if (delim.startsWith(':') && delim.endsWith(':')) return 'center';
            if (delim.endsWith(':')) return 'right';
            return 'left';
        });
        
        // Process body rows
        const rows = bodyRows.trim().split('\n').map(row => {
            const cells = row.trim().split('|').slice(1, -1);
            const cellsHtml = cells.map((cell, i) => {
                const align = alignments[i] ? `style="text-align:${alignments[i]}"` : '';
                return `<td ${align}>${cell.trim()}</td>`;
            }).join('');
            return `<tr>${cellsHtml}</tr>`;
        }).join('');
        
        return `<div class="markdown-table-wrapper">
            <table>
                <thead><tr>${headers}</tr></thead>
                <tbody>${rows}</tbody>
            </table>
        </div>`;
    });
}

/**
 * Process unordered lists
 * @param {string} html - The HTML content to process
 * @returns {string} Processed HTML with unordered lists
 */
function processUnorderedLists(html) {
    // Find unordered list blocks
    const listBlocks = html.match(/(?:^|\n)(?:[ \t]*[-*+][ \t]+.+\n?)+/g);
    
    if (!listBlocks) return html;
    
    listBlocks.forEach(block => {
        // Split into list items
        const items = block.match(/[ \t]*[-*+][ \t]+.+(?:\n|$)/g);
        
        if (!items) return;
        
        const listItems = items.map(item => {
            const content = item.replace(/^[ \t]*[-*+][ \t]+/, '').trim();
            return `<li class="px-list-item">${content}</li>`;
        }).join('');
        
        const listHtml = `<ul class="px-list px-unordered-list">${listItems}</ul>`;
        html = html.replace(block, listHtml);
    });
    
    return html;
}

/**
 * Process ordered lists
 * @param {string} html - The HTML content to process
 * @returns {string} Processed HTML with ordered lists
 */
function processOrderedLists(html) {
    // Find ordered list blocks
    const listBlocks = html.match(/(?:^|\n)(?:[ \t]*\d+\.[ \t]+.+\n?)+/g);
    
    if (!listBlocks) return html;
    
    listBlocks.forEach(block => {
        // Split into list items
        const items = block.match(/[ \t]*\d+\.[ \t]+.+(?:\n|$)/g);
        
        if (!items) return;
        
        const listItems = items.map(item => {
            const content = item.replace(/^[ \t]*\d+\.[ \t]+/, '').trim();
            return `<li class="px-list-item">${content}</li>`;
        }).join('');
        
        const listHtml = `<ol class="px-list px-ordered-list">${listItems}</ol>`;
        html = html.replace(block, listHtml);
    });
    
    return html;
}

/**
 * Process blockquotes
 * @param {string} html - The HTML content to process
 * @returns {string} Processed HTML with blockquotes
 */
function processBlockquotes(html) {
    // Find continuous blockquote lines
    const quoteRegex = /(?:^|\n)(?:&gt;|>)[ \t]?(.*?)(?=\n(?!(?:&gt;|>))|$)/gs;
    
    return html.replace(quoteRegex, function(match, content) {
        // Remove any trailing newlines
        content = content.replace(/\n$/, '');
        return `<blockquote class="px-blockquote">${content}</blockquote>`;
    });
}

/**
 * Process paragraphs
 * @param {string} html - The HTML content to process
 * @returns {string} Processed HTML with paragraphs
 */
function processParagraphs(html) {
    // Split content by double newlines (paragraph breaks)
    const paragraphs = html.split(/\n\n+/);
    
    return paragraphs.map(p => {
        // Skip if empty or already contains HTML tags
        if (!p.trim() || p.trim().match(/^<\/?[a-zA-Z]|^<blockquote|^<[uo]l|^<h[1-6]|^<hr|^<div class="code-block"|^<div class="table-wrapper"/)) {
            return p;
        }
        
        // Handle multi-line paragraphs (with single line breaks)
        const processedP = p.replace(/\n/g, '<br>');
        return `<p class="px-paragraph">${processedP}</p>`;
    }).join('\n\n');
}

/**
 * Attaches click event listeners to all code copy buttons in the chat
 */
export function attachCodeCopyListeners() {
    // Find all copy buttons in the chat container
    const copyButtons = document.querySelectorAll('.code-copy-btn');
    
    // Add click event listener to each button
    copyButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Find the closest code block
            const codeBlock = this.closest('.code-block');
            
            // Get the code content
            const codeElement = codeBlock.querySelector('code');
            
            // Get code text but remove any language headers or unnecessary elements
            let codeText = codeElement.textContent;
            
            // Remove potential header lines that start with common comment patterns
            // This regex identifies lines that look like headers or comments at the top of code
            codeText = codeText.replace(/^(\/\/.*|#.*|\s*\/\*.*\*\/\s*|<!-.*->)?\n?/, '');
            
            // Copy to clipboard
            navigator.clipboard.writeText(codeText)
                .then(() => {
                    // Show feedback that code was copied
                    const originalText = this.textContent;
                    this.textContent = 'Copied!';
                    
                    // Reset button text after a delay
                    setTimeout(() => {
                        this.textContent = originalText;
                    }, 2000);
                })
                .catch(err => {
                    console.error('Failed to copy text: ', err);
                    // Show error feedback
                    this.textContent = 'Failed!';
                    setTimeout(() => {
                        this.textContent = 'Copy';
                    }, 2000);
                });
        });
    });
}