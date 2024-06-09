require('dotenv').config();
const { Client } = require("@notionhq/client");

const notion = new Client({ auth: process.env.NOTION_KEY });

async function createSubPage(parentPageId, title) {
    try {
        const response = await notion.pages.create({
            parent: { page_id: parentPageId },
            properties: {
                title: [
                    {
                        type: 'text',
                        text: { content: title },
                    },
                ],
            },
        });
        console.log(`Subpage '${title}' created successfully:`, response.id);
        return response.id;
    } catch (error) {
        console.error(`Error creating subpage '${title}':`, error);
    }
}

async function addContentToPage(pageId, blocks) {
    try {
        for (const block of blocks) {
            await notion.blocks.children.append({
                block_id: pageId,
                children: [block],
            });
        }
        console.log("Content added successfully.");
    } catch (error) {
        console.error("Error adding content to page:", error);
    }
}

async function createInstructionPages(parentPageId, instructionNumber) {
    const instructionPageId = await createSubPage(parentPageId, `Instruction ${instructionNumber}`);
    const contentPageId = await createSubPage(instructionPageId, "Content");
    const errorMessagesPageId = await createSubPage(instructionPageId, "Error Messages");
    const correctAnswersPageId = await createSubPage(instructionPageId, "Correct Answers");

    // Add content to "Content" subpage
    const contentBlocks = [
        {
            object: "block",
            type: "paragraph",
            paragraph: {
                rich_text: [{
                    type: "text",
                    text: { content: `Instruction ${instructionNumber} content.` }
                }]
            }
        }
    ];
    await addContentToPage(contentPageId, contentBlocks);

    // Add error messages to "Error Messages" subpage
    const errorMessagesBlocks = [
        {
            object: "block",
            type: "child_page",
            child_page: {
                title: `Error Message ${instructionNumber}`
            }
        }
    ];
    const errorMessagePageId = await createSubPage(errorMessagesPageId, `Error Message ${instructionNumber}`);
    const errorMessageBlocks = [
        {
            object: "block",
            type: "paragraph",
            paragraph: {
                rich_text: [{
                    type: "text",
                    text: { content: `This is error message ${instructionNumber}.` }
                }]
            }
        }
    ];
    await addContentToPage(errorMessagePageId, errorMessageBlocks);

    // Add correct answers to "Correct Answers" subpage
    const correctAnswersBlocks = [
        {
            object: "block",
            type: "child_page",
            child_page: {
                title: `Correct Answer ${instructionNumber}`
            }
        }
    ];
    const correctAnswerPageId = await createSubPage(correctAnswersPageId, `Correct Answer ${instructionNumber}`);
    const correctAnswerBlocks = [
        {
            object: "block",
            type: "code",
            code: {
                rich_text: [{
                    type: "text",
                    text: { content: `const correctAnswer${instructionNumber} = 'Correct Answer';` }
                }],
                language: "javascript"
            }
        }
    ];
    await addContentToPage(correctAnswerPageId, correctAnswerBlocks);
}

async function createSubPagesWithContent(parentPageId) {
    // Create subpages
    const contentPageId = await createSubPage(parentPageId, "Content");
    const prefilledCodePageId = await createSubPage(parentPageId, "Pre-filled Code");
    const instructionsPageId = await createSubPage(parentPageId, "Instructions");

    // Define the blocks for the "Content" page
    const contentBlocks = [
        {
            object: "block",
            type: "paragraph",
            paragraph: {
                rich_text: [{
                    type: "text",
                    text: { content: "This is the initial paragraph in the Content page." }
                }]
            }
        },
        {
            object: "block",
            type: "bulleted_list_item",
            bulleted_list_item: {
                rich_text: [{
                    type: "text",
                    text: { content: "Bullet point 1" }
                }]
            }
        },
        {
            object: "block",
            type: "bulleted_list_item",
            bulleted_list_item: {
                rich_text: [{
                    type: "text",
                    text: { content: "Bullet point 2" }
                }]
            }
        },
        {
            object: "block",
            type: "heading_2",
            heading_2: {
                rich_text: [{
                    type: "text",
                    text: { content: "Example" }
                }]
            }
        },
        {
            object: "block",
            type: "code",
            code: {
                rich_text: [{
                    type: "text",
                    text: { content: "const example = 'Hello, world!';" }
                }],
                language: "javascript"
            }
        },
        {
            object: "block",
            type: "paragraph",
            paragraph: {
                rich_text: [{
                    type: "text",
                    text: { content: "This is another paragraph after the code block." }
                }]
            }
        },
        {
            object: "block",
            type: "bulleted_list_item",
            bulleted_list_item: {
                rich_text: [{
                    type: "text",
                    text: { content: "Another bullet point" }
                }]
            }
        },
        {
            object: "block",
            type: "heading_2",
            heading_2: {
                rich_text: [{
                    type: "text",
                    text: { content: "Instruction" }
                }]
            }
        },
        {
            object: "block",
            type: "numbered_list_item",
            numbered_list_item: {
                rich_text: [{
                    type: "text",
                    text: { content: "Step 1: Follow the instruction." }
                }],
                children: [
                    {
                        object: "block",
                        type: "toggle",
                        toggle: {
                            rich_text: [{
                                type: "text",
                                text: { content: "Hint: This is the hint for step 1." }
                            }],
                            children: [
                                {
                                    object: "block",
                                    type: "paragraph",
                                    paragraph: {
                                        rich_text: [{
                                            type: "text",
                                            text: { content: "Detailed hint content for step 1." }
                                        }]
                                    }
                                }
                            ]
                        }
                    }
                ]
            }
        },
        {
            object: "block",
            type: "numbered_list_item",
            numbered_list_item: {
                rich_text: [{
                    type: "text",
                    text: { content: "Step 2: Continue following the instructions." }
                }],
                children: [
                    {
                        object: "block",
                        type: "toggle",
                        toggle: {
                            rich_text: [{
                                type: "text",
                                text: { content: "Hint: This is the hint for step 2." }
                            }],
                            children: [
                                {
                                    object: "block",
                                    type: "paragraph",
                                    paragraph: {
                                        rich_text: [{
                                            type: "text",
                                            text: { content: "Detailed hint content for step 2." }
                                        }]
                                    }
                                }
                            ]
                        }
                    }
                ]
            }
        }
    ];

    // Add content to the "Content" subpage
    await addContentToPage(contentPageId, contentBlocks);

    // Define the blocks for the "Pre-filled Code" page
    const prefilledCodeBlocks = [
        {
            object: "block",
            type: "code",
            code: {
                rich_text: [{
                    type: "text",
                    text: { content: "const prefilledCodeExample = 'Pre-filled code example';" }
                }],
                language: "javascript"
            }
        }
    ];

    // Add content to the "Pre-filled Code" subpage
    await addContentToPage(prefilledCodePageId, prefilledCodeBlocks);

    // Create instruction pages with nested structure
    for (let i = 1; i <= 3; i++) {
        await createInstructionPages(instructionsPageId, i);
    }
}

const parentPageId = 'c0c8fdab09324d578277ddac0fcb7376'; // Replace with your parent page ID
createSubPagesWithContent(parentPageId);
