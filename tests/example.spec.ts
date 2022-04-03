// Import the test framework, file system, path and 
// frontmatter processing modules.
import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

// Configure the tests as parallel
// test.describe.configure({ mode: 'parallel' });

// Initialise the base URL and the array of content
// const baseURL = new URL('http://www.cloudwithchris.com');
let records = [];

// Read the content directory and parse the markdown files
function getFiles(dir, filelist) {

  // Read the directory
  let files = fs.readdirSync(dir);

  // Foreach file in the directory
  files.forEach(file => {

    // Check if the file is a directory
    if (fs.statSync(dir + file).isDirectory()) {
      // If it is a directory, recurse into it
      filelist = getFiles(dir + file + '/', filelist);
    // If it is a file, check if it is a markdown file
    } else if (path.extname(file) == '.md'){
      // If it is a markdown file, parse the frontmatter,
      // convert the property to lower for consistency
      // and add the resulting object to an array
      const object = Object.fromEntries(
        Object.entries(matter(fs.readFileSync(dir + file, 'utf8')).data).map(([k, v]) => [k.toLowerCase(), v])
      );
      filelist.push(
        {
          filename: dir.replace('content/',''),
          url: new URL(dir.replace('content/',''), 'https://www.cloudwithchris.com').toString(),
          title: object.title,
          description: object.description
        }
      );
    }
  });

  // Return the array of objects for testing
  return filelist;
}

function testTitle(record){
  // Check that the appropriate title is displayed
  // test(`Check heading is correct: ${record.filename}`, async ({ page }) => {
  //   //let directURL = new URL(record.filename, baseURL);
  //   await page.goto(record.filename);
  //   const title = page.locator('h1');
  //   await expect(title).toHaveText(record.title);
  // })

  // test(`Check page title is correct: ${record.filename}`, async ({ page }) => {
  //   //let directURL = new URL(record.filename, baseURL);
  //   let expectedTitle = record.title.concat(' | Cloud With Chris');
  //   await page.goto(record.filename);
  //   const title = page.locator('title');
  //   await expect(title).toHaveText(expectedTitle);
  //   const twittertitle = page.locator('meta[name="twitter:title"]');
  //   await expect(twittertitle).toHaveAttribute("content", expectedTitle);
  //   const ogtitle = page.locator('meta[property="og:title"]');
  //   await expect(ogtitle).toHaveAttribute("content", expectedTitle);
  // })


  // test(`Check organization metadata is correct: ${record.filename}`, async ({ page }) => {

  //   // Arrange
  //   const expectedObject = {
  //     "@context":"https://schema.org",
  //     "@type":"Organization",
  //     "url":"https://www.cloudwithchris.com/",
  //     "logo":"https://www.cloudwithchris.com/img/cloudwithchrislogo.png"
  //   }

  //   // Act
  //   await page.goto(record.filename);
  //   const actual = page.locator('id=meta-organisation');

  //   // Assertq
  //   expect(await actual.evaluate(node => JSON.parse(node.innerHTML))).toBe(expectedObject);
  // })

  // test(`Check website metadata is correct: ${record.filename}`, async ({ page }) => {

  //   // Arrange
  //   const expectedObject = {
  //     "@context":"http://schema.org",
  //     "@type":"WebSite",
  //     "url":"https://www.cloudwithchris.com/",
  //     "sameAs": [
  //       "https://twitter.com/CloudWithChris",
  //       "https://github.com/CloudWithChris"
  //     ],
  //     "name":"Cloud With Chris",
  //     "logo":"https://www.cloudwithchris.com/favicon.ico",
  //     "potentialAction": {
  //       "@type":"SearchAction",
  //       "target": {
  //         "@type":"EntryPoint",
  //         "urlTemplate":"https://www.cloudwithchris.com/search/?s={search_term_string}"
  //       },
  //       "query-input":"required name=search_term_string"
  //     }
  //   }    

  //   // Act
  //   await page.goto(record.filename);
  //   const actual = page.locator('id=meta-website');

  //   // Assert
  //   expect(await actual.evaluate(node => JSON.parse(node.innerHTML))).toBe(expectedObject);
  // })


  test(`Check Breadcrumbs metadata is correct: ${record.filename}`, async ({ page }) => {

    // Arrange - N/A

    // Act
    await page.goto(record.filename);
    const actual = page.locator('id=meta-breadcrumbs');
    const actualObject = await actual.evaluate(node => JSON.parse(node.innerHTML));


    // Assert
    expect(actualObject.itemListElement.length).toBeGreaterThanOrEqual(2);
    expect(actualObject.itemListElement[actualObject.itemListElement.length - 1].name).toBe(record.title);
  })

  // test(`Check page has description metadata: ${record.filename}`, async ({ page }) => {
  //   //let directURL = new URL(record.filename, baseURL);
  //   await page.goto(record.filename);
  //   const description = page.locator('meta[name="description"]');
  //   await expect(description).toHaveAttribute("content", record.description);
  //   const twitterdescription = page.locator('meta[name="twitter:description"]');
  //   await expect(twitterdescription).toHaveAttribute("content", record.description);
  //   const ogdescription = page.locator('meta[property="og:description"]');
  //   await expect(ogdescription).toHaveAttribute("content", record.description);
  // })
}

// Iterate through the records and run several tests per record
for (const record of getFiles('content/episode/', records)) {
  testTitle(record);
}