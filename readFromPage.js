require('dotenv').config();
const { Client } = require("@notionhq/client");

const notion = new Client({ auth: process.env.NOTION_KEY });

async function retrieveData() {
    const databaseId = process.env.DATABASE_ID;

    try {
        const response = await notion.databases.query({
            database_id: databaseId,
        });

        for (const page of response.results) {
            await handlePageBlocks(page.id); // Call the function to handle blocks for each page
        }

    } catch (error) {
        console.error("Error retrieving data from Notion database:", error);
    }
}

async function getChildBlocks(blockId) {
    try {
        const response = await notion.blocks.children.list({
            block_id: blockId,
        });
        return response.results;
    } catch (error) {
        console.error("Error retrieving child blocks:", error);
        return [];
    }
}

async function handleBlocksRecursively(blocks) {
    for (const block of blocks) {
        await handleBlock(block);
        if (block.has_children) {
            // Recursively handle children blocks
            await handleBlocksRecursively(await getChildBlocks(block.id));
        }
    }
}

async function handleBlock(block, depth = 0) {
    const indent = '  '.repeat(depth); // Adjust indentation based on depth
    switch (block.type) {
        case 'paragraph':
            if (block.paragraph.rich_text.length > 0)
                for (const paragraph of block.paragraph.rich_text) {
                    console.log(paragraph.plain_text)
                }
            break;
        case 'heading_1':
        case 'heading_2':
        case 'heading_3':
            console.log(block[block.type].rich_text[0].text.content);
            break;
        case 'to_do':
            console.log(`${indent}To-Do: ${block.to_do.text}`);
            break;
        case 'bulleted_list_item':
            console.log(`${indent}Bulleted List Item: ${block.bulleted_list_item.text}`);
            break;
        case 'numbered_list_item':
            console.log(`${indent}Numbered List Item: ${block.numbered_list_item.text}`);
            break;
        case 'toggle':
            console.log(`${indent}Toggle: ${block.toggle.text}`);
            break;
        case 'quote':
            console.log(`${indent}Quote: ${block.quote.text}`);
            break;
        case 'code':
            console.log(`${indent}Code: ${block.code.text}`);
            break;
        case 'unsupported':
            break;
        case 'child_page':
            console.log(`${indent}Child Page Title: ${block.child_page.title}`);
            break;
        default:
    }
}


async function handlePageBlocks(pageId) {
    try {
        const blocks = await getChildBlocks(pageId);
        await handleBlocksRecursively(blocks);
    } catch (error) {
        console.error("Error handling blocks in page:", error);
    }
}

retrieveData();
