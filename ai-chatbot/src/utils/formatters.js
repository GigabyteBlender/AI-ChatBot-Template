/**
 * Utility functions for formatting data
 */

/**
 * Format a date into a readable string
 * @param {Date|string|number} date - Date to format
 * @param {Object} options - Formatting options
 * @returns {string} - Formatted date string
 */
export const formatDate = (date, options = {}) => {
	try {
		const dateObj = date instanceof Date ? date : new Date(date);

		// Default options for date formatting
		const defaultOptions = {
			relative: false, // Whether to use relative time (e.g., "5 minutes ago")
			includeTime: false, // Whether to include the time
			shortMonth: true, // Whether to use short month names
			...options
		};

		// If relative time is requested and date is recent enough
		if (defaultOptions.relative) {
			const now = new Date();
			const diffMs = now - dateObj;
			const diffSec = Math.floor(diffMs / 1000);
			const diffMin = Math.floor(diffSec / 60);
			const diffHour = Math.floor(diffMin / 60);
			const diffDay = Math.floor(diffHour / 24);

			if (diffSec < 60) return 'just now';
			if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? '' : 's'} ago`;
			if (diffHour < 24) return `${diffHour} hour${diffHour === 1 ? '' : 's'} ago`;
			if (diffDay < 7) return `${diffDay} day${diffDay === 1 ? '' : 's'} ago`;
		}

		// Format as regular date
		const monthNames = defaultOptions.shortMonth ?
			['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] :
			['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

		const day = dateObj.getDate();
		const month = monthNames[dateObj.getMonth()];
		const year = dateObj.getFullYear();
		const currentYear = new Date().getFullYear();

		// Only include year if it's not the current year
		const yearStr = year !== currentYear ? `, ${year}` : '';

		// Format the date part
		let formattedDate = `${month} ${day}${yearStr}`;

		// Add time if requested
		if (defaultOptions.includeTime) {
			const hours = dateObj.getHours();
			const minutes = dateObj.getMinutes().toString().padStart(2, '0');
			const ampm = hours >= 12 ? 'PM' : 'AM';
			const formattedHours = hours % 12 || 12; // Convert 0 to 12 for 12-hour format

			formattedDate += ` at ${formattedHours}:${minutes} ${ampm}`;
		}

		return formattedDate;
	} catch (error) {
		console.error('Date formatting error:', error);
		return 'Invalid date';
	}
};

/**
 * Format a number with comma separators and optional decimal places
 * @param {number} number - Number to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} - Formatted number string
 */
export const formatNumber = (number, decimals = 0) => {
	try {
		return Number(number).toLocaleString('en-US', {
			minimumFractionDigits: decimals,
			maximumFractionDigits: decimals
		});
	} catch (error) {
		console.error('Number formatting error:', error);
		return number.toString();
	}
};

/**
 * Format number of bytes to human-readable size
 * @param {number} bytes - Number of bytes
 * @param {number} decimals - Number of decimal places
 * @returns {string} - Formatted file size
 */
export const formatFileSize = (bytes, decimals = 2) => {
	if (bytes === 0) return '0 Bytes';

	const k = 1024;
	const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
	const i = Math.floor(Math.log(bytes) / Math.log(k));

	return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
};

/**
 * Format bytes into a human-readable string
 * @param {number} bytes - Number of bytes
 * @param {number} decimals - Number of decimal places
 * @returns {string} - Formatted size string (e.g., "1.5 MB")
 */
export const formatBytes = (bytes, decimals = 2) => {
	if (bytes === 0) return '0 Bytes';

	const k = 1024;
	const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
	const i = Math.floor(Math.log(bytes) / Math.log(k));

	return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
};

/**
 * Truncate text with ellipsis if it exceeds the max length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length before truncation
 * @returns {string} - Truncated text
 */
export const truncateText = (text, maxLength = 100) => {
	if (!text || text.length <= maxLength) return text;

	// Truncate at word boundary when possible
	const truncated = text.substring(0, maxLength);
	const lastSpace = truncated.lastIndexOf(' ');

	// If there's a space near the end, truncate there
	if (lastSpace > maxLength * 0.8) {
		return truncated.substring(0, lastSpace) + '...';
	}

	return truncated + '...';
};

/**
 * Convert markdown to plain text
 * @param {string} markdown - Markdown text
 * @returns {string} - Plain text
 */
export const markdownToPlainText = (markdown) => {
	if (!markdown) return '';

	return markdown
		// Remove headers
		.replace(/#{1,6}\s?/g, '')
		// Remove emphasis
		.replace(/\*\*(.*?)\*\*/g, '$1')
		.replace(/\*(.*?)\*/g, '$1')
		.replace(/__(.*?)__/g, '$1')
		.replace(/_(.*?)_/g, '$1')
		// Remove code blocks and inline code
		.replace(/```[\s\S]*?```/g, '')
		.replace(/`(.*?)`/g, '$1')
		// Remove blockquotes
		.replace(/^\s*>\s/gm, '')
		// Remove links
		.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
		// Remove images
		.replace(/!\[([^\]]+)\]\([^)]+\)/g, '')
		// Remove HTML tags
		.replace(/<[^>]*>/g, '')
		// Fix multiple line breaks
		.replace(/\n{3,}/g, '\n\n')
		.trim();
};