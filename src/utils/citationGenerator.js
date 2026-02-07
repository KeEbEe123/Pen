// Citation generation utilities

export const extractMetadata = (url, title) => {
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname.replace('www.', '');
    const date = new Date();
    
    return {
      url,
      title: title || 'Untitled',
      domain,
      accessDate: date.toISOString().split('T')[0],
      year: date.getFullYear()
    };
  } catch (error) {
    return {
      url,
      title: title || 'Untitled',
      domain: '',
      accessDate: new Date().toISOString().split('T')[0],
      year: new Date().getFullYear()
    };
  }
};

export const generateCitation = (metadata, format = 'APA', customData = {}) => {
  const {
    title,
    author = '',
    year = metadata.year,
    domain = metadata.domain,
    url = metadata.url,
    accessDate = metadata.accessDate,
    publisher = domain
  } = { ...metadata, ...customData };

  switch (format) {
    case 'APA':
      return generateAPA({ title, author, year, publisher, url, accessDate });
    case 'MLA':
      return generateMLA({ title, author, year, domain, url, accessDate });
    case 'Chicago':
      return generateChicago({ title, author, year, publisher, url, accessDate });
    case 'IEEE':
      return generateIEEE({ title, author, year, url, accessDate });
    default:
      return generateAPA({ title, author, year, publisher, url, accessDate });
  }
};

const generateAPA = ({ title, author, year, publisher, url, accessDate }) => {
  let citation = '';
  
  if (author) {
    citation += `${author}. `;
  }
  
  citation += `(${year}). `;
  citation += `${title}. `;
  
  if (publisher) {
    citation += `${publisher}. `;
  }
  
  citation += `Retrieved ${formatDate(accessDate)}, from ${url}`;
  
  return citation;
};

const generateMLA = ({ title, author, year, domain, url, accessDate }) => {
  let citation = '';
  
  if (author) {
    citation += `${author}. `;
  }
  
  citation += `"${title}." `;
  citation += `${domain}, `;
  citation += `${year}, `;
  citation += `${url}. `;
  citation += `Accessed ${formatDate(accessDate)}.`;
  
  return citation;
};

const generateChicago = ({ title, author, year, publisher, url, accessDate }) => {
  let citation = '';
  
  if (author) {
    citation += `${author}. `;
  }
  
  citation += `"${title}." `;
  
  if (publisher) {
    citation += `${publisher}. `;
  }
  
  citation += `${year}. `;
  citation += `${url} `;
  citation += `(accessed ${formatDate(accessDate)}).`;
  
  return citation;
};

const generateIEEE = ({ title, author, year, url, accessDate }) => {
  let citation = '';
  
  if (author) {
    citation += `${author}, `;
  }
  
  citation += `"${title}," `;
  citation += `${year}. `;
  citation += `[Online]. Available: ${url}. `;
  citation += `[Accessed: ${formatDate(accessDate)}].`;
  
  return citation;
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const months = ['Jan.', 'Feb.', 'Mar.', 'Apr.', 'May', 'Jun.', 'Jul.', 'Aug.', 'Sep.', 'Oct.', 'Nov.', 'Dec.'];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
};

export const exportCitations = (citations, format = 'text') => {
  if (format === 'bibtex') {
    return citations.map((cit, idx) => {
      const key = `ref${idx + 1}`;
      return `@misc{${key},
  title = {${cit.metadata.title}},
  author = {${cit.metadata.author || 'Unknown'}},
  year = {${cit.metadata.year}},
  url = {${cit.metadata.url}},
  note = {Accessed: ${cit.metadata.accessDate}}
}`;
    }).join('\n\n');
  }
  
  if (format === 'ris') {
    return citations.map(cit => {
      return `TY  - ELEC
TI  - ${cit.metadata.title}
AU  - ${cit.metadata.author || 'Unknown'}
PY  - ${cit.metadata.year}
UR  - ${cit.metadata.url}
Y2  - ${cit.metadata.accessDate}
ER  -`;
    }).join('\n\n');
  }
  
  return citations.map(cit => cit.citation_text).join('\n\n');
};
