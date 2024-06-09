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
            console.log("Page ID:", page.id);
            console.log("Properties:", page.properties);

            // Retrieve subpages
            await retrieveSubpages(page.id);
        }

    } catch (error) {
        console.error("Error retrieving data from Notion database:", error);
    }
}

async function retrieveSubpages(pageId) {
    try {
        const response = await notion.blocks.children.list({
            block_id: pageId,
        });

        for (const block of response.results) {
            if (block.type === 'child_page') {
                console.log("Subpage Title:", block.child_page.title);
                await handleSubpage(block.id, block.child_page.title);
            }
        }
    } catch (error) {
        console.error(`Error retrieving subpages for page ${pageId}:`, error);
    }
}

async function handleSubpage(subpageId, title) {
    if (title === 'Content') {
        await retrieveTextContent(subpageId);
    } else if (title === 'Pre-filled Code') {
        await retrieveCodeBlock(subpageId);
    } else if (title === 'Instructions') {
        await retrieveInstructions(subpageId);
    }
}

async function retrieveTextContent(pageId) {
    try {
        const response = await notion.blocks.children.list({
            block_id: pageId,
        });

        for (const block of response.results) {
            switch (block.type) {
                case 'paragraph':
                    await handleParagraph(block);
                    break;
                case 'heading_1':
                case 'heading_2':
                case 'heading_3':
                    await handleHeading(block);
                    break;
                case 'bulleted_list_item':
                    await handleBulletedListItem(block);
                    break;
                case 'numbered_list_item':
                    await handleNumberedListItem(block);
                    break;
                case 'code':
                    await handleCode(block);
                    break;
                case 'toggle':
                    await handleToggle(block);
                    break;
                case 'quote':
                    await handleQuote(block);
                    break;
                // Add cases for other text-based blocks as needed
                default:
                    break;
            }
        }
    } catch (error) {
        console.error(`Error retrieving text content for page ${pageId}:`, error);
    }
}

async function handleHeading(block) {
    try {
        const content = block[block.type].text.rich_text;
        if (content && content.length > 0) {
            console.log(`Heading: ${content.map(item => item.text.content).join(' ')}`);
        }
    } catch (error) {
        console.error(`Error handling heading:`, error);
    }
}

async function handleBulletedListItem(block) {
    try {
        if (block.bulleted_list_item) {
            const richText = block.bulleted_list_item.rich_text;
            const color = block.bulleted_list_item.color;
            console.log(`Bulleted List Item (Color: ${color}):`);
            if (richText && richText.length > 0) {
                const content = richText.map(item => item.text.content).join(' ');
                console.log(content);
            }
            if (block.children && block.children.length > 0) {
                console.log("Nested Child Blocks:");
                for (const childBlock of block.children) {
                    console.log(childBlock.type);
                    // Handle other child block types as needed
                }
            }
        }
    } catch (error) {
        console.error(`Error handling bulleted list item:`, error);
    }
}

async function handleNumberedListItem(block) {
    try {
        if (block.numbered_list_item) {
            const richText = block.numbered_list_item.rich_text;
            const color = block.numbered_list_item.color;
            console.log(`Numbered List Item (Color: ${color}):`);
            if (richText && richText.length > 0) {
                const content = richText.map(item => item.text.content).join(' ');
                console.log(content);
            }
            if (block.children && block.children.length > 0) {
                console.log("Nested Child Blocks:");
                for (const childBlock of block.children) {
                    if (childBlock.type === 'paragraph') {
                        await handleParagraph(childBlock);
                    } else if (childBlock.type === 'toggle') {
                        await handleToggle(childBlock);
                    }
                    // Add other conditions to handle additional types of child blocks if needed
                }
            }
        }
    } catch (error) {
        console.error(`Error handling numbered list item:`, error);
    }
}

async function handleQuote(block) {
    try {
        const content = block.quote.text.rich_text;
        if (content && content.length > 0) {
            console.log(`Quote: ${content.map(item => item.text.content).join(' ')}`);
        }
    } catch (error) {
        console.error(`Error handling quote:`, error);
    }
}

async function handleToggle(block) {
    try {
        if (block.toggle) {
            const richText = block.toggle.rich_text;
            const color = block.toggle.color;
            console.log(`Toggle Block (Color: ${color}):`);
            if (richText && richText.length > 0) {
                const content = richText.map(item => item.text.content).join(' ');
                console.log(`Toggle Block Content: ${content}`);
            }

            // Find and handle children blocks
            await findAndHandleToggleChildren(block.id);
        }
    } catch (error) {
        console.error(`Error handling toggle block:`, error);
    }
}

async function findAndHandleToggleChildren(blockId) {
    try {
        const response = await notion.blocks.children.list({
            block_id: blockId,
        });

        if (response.results && response.results.length > 0) {
            console.log("Toggle Children:");
            for (const childBlock of response.results) {
                // Handle each child block according to its type
                if (childBlock.type === 'paragraph') {
                    await handleParagraph(childBlock);
                }
                // Add other conditions to handle additional types of child blocks if needed
            }
        } else {
            console.log("Toggle block has no children.");
        }
    } catch (error) {
        console.error("Error retrieving toggle children:", error);
    }
}

async function handleParagraph(block) {
    const content = block.paragraph.rich_text;
    if (content && content.length > 0) {
        console.log(`Paragraph: ${content.map(item => item.text.content).join(' ')}`);
    }
}

async function handleCode(block) {
    const content = block.code.rich_text;
    if (content && content.length > 0) {
        console.log(`Code: ${content.map(item => item.text.content).join(' ')}`);
    }
}

async function retrieveCodeBlock(pageId) {
    try {
        const response = await notion.blocks.children.list({
            block_id: pageId,
        });

        for (const block of response.results) {
            if (block.type === 'code') {
                const content = block.code.rich_text;
                if (content && content.length > 0) {
                    console.log(`Code Block: ${content.map(item => item.text.content).join(' ')}`);
                }
            }
        }
    } catch (error) {
        console.error(`Error retrieving code block for page ${pageId}:`, error);
    }
}

async function retrieveInstructions(pageId) {
    try {
        const response = await notion.blocks.children.list({
            block_id: pageId,
        });

        for (const block of response.results) {
            if (block.type === 'child_page') {
                console.log(`Instruction Subpage Title: ${block.child_page.title}`);
                await handleInstructionSubpage(block.id, block.child_page.title);
            }
        }
    } catch (error) {
        console.error(`Error retrieving instructions for page ${pageId}:`, error);
    }
}

async function handleInstructionSubpage(subpageId, title) {
    if (title.startsWith('Instruction')) {
        await retrieveInstructionContent(subpageId);
        await retrieveErrorMessages(subpageId);
        await retrieveCorrectAnswers(subpageId);
    }
}

async function retrieveInstructionContent(pageId) {
    try {
        const response = await notion.blocks.children.list({
            block_id: pageId,
        });

        for (const block of response.results) {
            if (block.type === 'paragraph') {
                const content = block.paragraph.rich_text;
                if (content && content.length > 0) {
                    console.log(`Instruction Content: ${content.map(item => item.text.content).join(' ')}`);
                }
            }
        }
    } catch (error) {
        console.error(`Error retrieving instruction content for page ${pageId}:`, error);
    }
}

async function retrieveErrorMessages(pageId) {
    try {
        const response = await notion.blocks.children.list({
            block_id: pageId,
        });

        for (const block of response.results) {
            if (block.type === 'child_page' && block.child_page.title.startsWith('Error Message')) {
                console.log(`Error Message Title: ${block.child_page.title}`);
                await retrieveErrorMessage(block.id);
            }
        }
    } catch (error) {
        console.error(`Error retrieving error messages for page ${pageId}:`, error);
    }
}

async function retrieveErrorMessage(pageId) {
    try {
        const response = await notion.blocks.children.list({
            block_id: pageId,
        });

        for (const block of response.results) {
            if (block.type === 'paragraph') {
                const content = block.paragraph.rich_text;
                if (content && content.length > 0) {
                    console.log(`Error Message: ${content.map(item => item.text.content).join(' ')}`);
                }
            }
        }
    } catch (error) {
        console.error(`Error retrieving error message for page ${pageId}:`, error);
    }
}

async function retrieveCorrectAnswers(pageId) {
    try {
        const response = await notion.blocks.children.list({
            block_id: pageId,
        });

        for (const block of response.results) {
            if (block.type === 'child_page' && block.child_page.title.startsWith('Answer')) {
                console.log(`Answer Title: ${block.child_page.title}`);
                await retrieveAnswer(block.id);
            }
        }
    } catch (error) {
        console.error(`Error retrieving correct answers for page ${pageId}:`, error);
    }
}

async function retrieveAnswer(pageId) {
    try {
        const response = await notion.blocks.children.list({
            block_id: pageId,
        });

        for (const block of response.results) {
            if (block.type === 'paragraph') {
                const content = block.paragraph.rich_text;
                if (content && content.length > 0) {
                    console.log(`Answer: ${content.map(item => item.text.content).join(' ')}`);
                }
            }
        }
    } catch (error) {
        console.error(`Error retrieving answer for page ${pageId}:`, error);
    }
}

retrieveData();
