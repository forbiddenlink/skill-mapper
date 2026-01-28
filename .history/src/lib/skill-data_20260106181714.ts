import { Node, Edge } from 'reactflow';

export type SkillStatus = 'locked' | 'available' | 'in-progress' | 'mastered' | 'decayed';
export type SkillTier = 'foundation' | 'frontend-2' | 'backend-data' | 'ai-engineer' | 'systems';
export type SkillCategory = 'frontend' | 'backend' | 'devops' | 'cs' | 'ml' | 'data';

export interface SkillQuiz {
    question: string;
    options: string[];
    correctIndex: number;
}

export interface SkillData {
    id: string;
    title: string;
    description: string;
    tier: SkillTier;
    category: SkillCategory;
    status: SkillStatus;
    prerequisites: string[]; // List of Skill IDs required
    xpReward: number;
    lastPracticedAt?: number;
    resources: {
        label: string;
        url: string;
        type: 'video' | 'article' | 'course' | 'paper' | 'lab';
    }[];
    quiz?: SkillQuiz[];
}

// React Flow Node structure
export type SkillNode = Node<SkillData>;

const RAW_SKILLS: Omit<SkillNode, 'position'>[] = [
    // --- TIER 1: FOUNDATION ---
    {
        id: 'web-standards',
        type: 'skill',
        data: {
            id: 'web-standards',
            title: 'Web Standards',
            description: 'Semantic HTML5, Accessibility (ARIA), and SEO basics. The bedrock of the web.',
            tier: 'foundation',
            category: 'frontend',
            status: 'available',
            prerequisites: [],
            xpReward: 100,
            resources: [
                { label: 'MDN Web Docs', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML', type: 'article' },
                { label: 'Web.dev Accessibility', url: 'https://web.dev/learn/accessibility/', type: 'course' }
            ],
            quiz: [
                {
                    question: "What tag is used for the main heading of a page?",
                    options: ["<header>", "<h1>", "<title>", "<head>"],
                    correctIndex: 1
                },
                {
                    question: "Which attribute provides alternative text for images?",
                    options: ["src", "title", "alt", "href"],
                    correctIndex: 2
                }
            ]
        },
    },
    {
        id: 'git-ops',
        type: 'skill',
        data: {
            id: 'git-ops',
            title: 'GitOps Basics',
            description: 'Version control, GitHub Flow, and Pull Requests.',
            tier: 'foundation',
            category: 'devops',
            status: 'available',
            prerequisites: [],
            xpReward: 100,
            resources: [
                { label: 'Git SCM Book', url: 'https://git-scm.com/book/en/v2', type: 'article' },
                { label: 'GitHub Skills', url: 'https://skills.github.com/', type: 'course' }
            ],
            quiz: [
                {
                    question: "What command creates a new branch and switches to it?",
                    options: ["git checkout -b feature", "git branch feature", "git switch feature", "git new feature"],
                    correctIndex: 0
                },
                {
                    question: "What is the folder name where Git stores project history?",
                    options: [".github", ".history", ".git", "git_data"],
                    correctIndex: 2
                }
            ]
        },
    },
    {
        id: 'es-next',
        type: 'skill',
        data: {
            id: 'es-next',
            title: 'JavaScript ESNext',
            description: 'Modern JS: Async/Await, Modules, DOM Manipulation, and functional patterns.',
            tier: 'foundation',
            category: 'cs',
            status: 'locked',
            prerequisites: ['web-standards'],
            xpReward: 150,
            resources: [
                { label: 'JavaScript.info', url: 'https://javascript.info/', type: 'course' },
                { label: 'You Don\'t Know JS', url: 'https://github.com/getify/You-Dont-Know-JS', type: 'article' }
            ],
            quiz: [
                {
                    question: "What keyword pauses the execution of an async function?",
                    options: ["stop", "await", "yield", "pause"],
                    correctIndex: 1
                },
                {
                    question: "Which method creates a new array by applying a function to every element?",
                    options: ["filter()", "reduce()", "map()", "forEach()"],
                    correctIndex: 2
                }
            ]
        },
    },
    {
        id: 'python-core',
        type: 'skill',
        data: {
            id: 'python-core',
            title: 'Python for AI',
            description: 'Data structures, NumPy, Pandas. The language of Machine Learning.',
            tier: 'foundation',
            category: 'cs',
            status: 'available',
            prerequisites: [],
            xpReward: 150,
            resources: [
                { label: 'Real Python', url: 'https://realpython.com/', type: 'course' },
                { label: 'NumPy Quickstart', url: 'https://numpy.org/doc/stable/user/quickstart.html', type: 'article' }
            ],
            quiz: [
                {
                    question: "How do you select a column 'age' from a Pandas DataFrame 'df'?",
                    options: ["df.select('age')", "df['age']", "df.get('age')", "df -> age"],
                    correctIndex: 1
                },
                {
                    question: "Which library is the foundation for most scientific computing in Python?",
                    options: ["Pandas", "Scikit Level", "NumPy", "Matplotlib"],
                    correctIndex: 2
                }
            ]
        },
    },

    // --- TIER 2: FRONTEND ENGINEERING 2.0 ---
    {
        id: 'react-core',
        type: 'skill',
        data: {
            id: 'react-core',
            title: 'React Core',
            description: 'Components, JSX, Virtual DOM, and the "Thinking in React" mental model.',
            tier: 'frontend-2',
            category: 'frontend',
            status: 'locked',
            prerequisites: ['es-next'],
            xpReward: 200,
            resources: [
                { label: 'React.dev Docs', url: 'https://react.dev/learn', type: 'article' }
            ],
            quiz: [
                {
                    question: "What hook triggers a re-render when its value changes?",
                    options: ["useRef", "useEffect", "useState", "useMemo"],
                    correctIndex: 2
                },
                {
                    question: "Which of these is NOT a Rule of Hooks?",
                    options: ["Only call hooks at top level", "Only call hooks in React functions", "Only call hooks in class components", "Do not call hooks in loops"],
                    correctIndex: 2
                }
            ]
        },
    },
    {
        id: 'tailwind',
        type: 'skill',
        data: {
            id: 'tailwind',
            title: 'Tailwind CSS',
            description: 'Utility-first CSS architecture and design systems.',
            tier: 'frontend-2',
            category: 'frontend',
            status: 'locked',
            prerequisites: ['web-standards'],
            xpReward: 150,
            resources: [
                { label: 'Tailwind Docs', url: 'https://tailwindcss.com/docs', type: 'article' }
            ],
            quiz: [
                {
                    question: "Which class would you use to making text red?",
                    options: ["text-red-500", "color-red", "font-red", "red-text"],
                    correctIndex: 0
                },
                {
                    question: "What is the directive to inject Tailwind styles in CSS?",
                    options: ["@include", "@tailwind", "@import", "@use"],
                    correctIndex: 1
                }
            ]
        },
    },
    {
        id: 'typescript',
        type: 'skill',
        data: {
            id: 'typescript',
            title: 'TypeScript',
            description: 'Static typing, interfaces, and generics. Standard for enterprise web.',
            tier: 'frontend-2',
            category: 'cs',
            status: 'locked',
            prerequisites: ['es-next'],
            xpReward: 200,
            resources: [
                { label: 'Total TypeScript', url: 'https://www.totaltypescript.com/tutorials', type: 'course' }
            ],
            quiz: [
                {
                    question: "Which symbol denotes an optional property in an interface?",
                    options: ["!", "?", "*", "#"],
                    correctIndex: 1
                },
                {
                    question: "What type represents 'any value' but is safer than 'any'?",
                    options: ["void", "never", "unknown", "object"],
                    correctIndex: 2
                }
            ]
        },
    },
    {
        id: 'testing-quality',
        type: 'skill',
        data: {
            id: 'testing-quality',
            title: 'Testing & Quality',
            description: 'Unit testing with Vitest and E2E with Playwright to ensure reliability.',
            tier: 'frontend-2',
            category: 'devops',
            status: 'locked',
            prerequisites: ['react-core', 'typescript'],
            xpReward: 200,
            resources: [
                { label: 'Vitest Guide', url: 'https://vitest.dev/guide/', type: 'article' },
                { label: 'Playwright Docs', url: 'https://playwright.dev/', type: 'article' }
            ],
            quiz: [
                {
                    question: "Which tool is primarily used for Unit Testing in this stack?",
                    options: ["Playwright", "Vitest", "Cypress", "Selenium"],
                    correctIndex: 1
                },
                {
                    question: "What kind of testing simulates a real user traversing the app?",
                    options: ["Unit Testing", "Integration Testing", "E2E (End-to-End)", "Static Analysis"],
                    correctIndex: 2
                }
            ]
        },
    },
    {
        id: 'async-state',
        type: 'skill',
        data: {
            id: 'async-state',
            title: 'Async State',
            description: 'Managing server state and caching with TanStack Query.',
            tier: 'frontend-2',
            category: 'frontend',
            status: 'locked',
            prerequisites: ['react-core', 'typescript'],
            xpReward: 200,
            resources: [
                { label: 'TanStack Query', url: 'https://tanstack.com/query/latest', type: 'article' }
            ],
            quiz: [
                {
                    question: "What is the primary purpose of TanStack Query?",
                    options: ["Global State Management", "Form Handling", "Async State & Caching", "Routing"],
                    correctIndex: 2
                },
                {
                    question: "Which hook is used to fetch data?",
                    options: ["useMutation", "useQuery", "useFetch", "useGet"],
                    correctIndex: 1
                }
            ]
        },
    },

    // --- TIER 3: BACKEND & DATA ---
    {
        id: 'node-runtime',
        type: 'skill',
        data: {
            id: 'node-runtime',
            title: 'Node.js Runtime',
            description: 'Event loop, Buffers, Streams, and File System operations.',
            tier: 'backend-data',
            category: 'backend',
            status: 'locked',
            prerequisites: ['es-next'],
            xpReward: 200,
            resources: [
                { label: 'Node.js Guides', url: 'https://nodejs.org/en/docs/guides/', type: 'article' }
            ],
            quiz: [
                {
                    question: "Node.js is built on which JavaScript engine?",
                    options: ["SpiderMonkey", "V8", "JavaScriptCore", "Chakra"],
                    correctIndex: 1
                },
                {
                    question: "What allows Node.js to perform non-blocking I/O?",
                    options: ["Multi-threading", "The Event Loop", "Virtual Machine", "Compilation"],
                    correctIndex: 1
                }
            ]
        },
    },
    {
        id: 'postgresql',
        type: 'skill',
        data: {
            id: 'postgresql',
            title: 'PostgreSQL',
            description: 'Relational data modeling, SQL queries, and normalization.',
            tier: 'backend-data',
            category: 'data',
            status: 'locked',
            prerequisites: ['node-runtime'],
            xpReward: 250,
            resources: [
                { label: 'Postgres Tutorial', url: 'https://www.postgresqltutorial.com/', type: 'course' }
            ],
            quiz: [
                {
                    question: "Which SQL command retrieves data from a database?",
                    options: ["INSERT", "UPDATE", "SELECT", "DELETE"],
                    correctIndex: 2
                },
                {
                    question: "What format does PostgreSQL use to store JSON data binary?",
                    options: ["JSON", "JSONB", "BLOB", "TEXT"],
                    correctIndex: 1
                }
            ]
        },
    },
    {
        id: 'data-pipelines',
        type: 'skill',
        data: {
            id: 'data-pipelines',
            title: 'Data Pipelines',
            description: 'ETL/ELT workflows using Python. Preparing data for AI.',
            tier: 'backend-data',
            category: 'data',
            status: 'locked',
            prerequisites: ['python-core', 'postgresql'],
            xpReward: 300,
            resources: [
                { label: 'Data Engineering Zoomcamp', url: 'https://github.com/DataTalksClub/data-engineering-zoomcamp', type: 'course' },
                { label: 'Apache Airflow Concepts', url: 'https://airflow.apache.org/docs/apache-airflow/stable/core-concepts/index.html', type: 'article' }
            ],
            quiz: [
                {
                    question: "What does ETL stand for?",
                    options: ["Extract, Transform, Load", "Evaluate, Test, Launch", "Encrypt, Transfer, Lock", "Edit, Type, List"],
                    correctIndex: 0
                },
                {
                    question: "Which tool is commonly used for orchestrating pipelines?",
                    options: ["Apache Airflow", "Redis", "Nginx", "React"],
                    correctIndex: 0
                }
            ]
        },
    },
    {
        id: 'vector-db',
        type: 'skill',
        data: {
            id: 'vector-db',
            title: 'Vector Databases',
            description: 'Storing high-dimensional embeddings (Pinecone, Weaviate, pgvector). critical for AI memory.',
            tier: 'backend-data',
            category: 'data',
            status: 'locked',
            prerequisites: ['postgresql'],
            xpReward: 300,
            resources: [
                { label: 'Vector DB Fundamentals', url: 'https://www.coursera.org/learn/vector-databases-embeddings-applications', type: 'course' },
                { label: 'Pinecone Learning Center', url: 'https://www.pinecone.io/learn/', type: 'article' }
            ],
            quiz: [
                {
                    question: "What do Vector Databases optimzed for?",
                    options: ["Storing Images", "Similarity Search (Nearest Neighbor)", "Transaction Processing", "Key-Value lookup"],
                    correctIndex: 1
                },
                {
                    question: "Which metric is commonly used to measure semantic similarity?",
                    options: ["Cosine Similarity", "Alphabetical Order", "Timestamp", "File Size"],
                    correctIndex: 0
                }
            ]
        },
    },

    // --- TIER 4: AI ENGINEERING ---
    {
        id: 'prompt-eng',
        type: 'skill',
        data: {
            id: 'prompt-eng',
            title: 'Prompt Engineering',
            description: 'Chain-of-Thought, ReAct, and System Prompt design patterns.',
            tier: 'ai-engineer',
            category: 'ml',
            status: 'locked',
            prerequisites: ['llm-integration'], // Note: circular dep fix upcoming
            xpReward: 250,
            resources: [
                { label: 'Prompt Engineering Guide', url: 'https://www.promptingguide.ai/', type: 'course' },
                { label: 'OpenAI Cookbook', url: 'https://github.com/openai/openai-cookbook', type: 'lab' }
            ],
            quiz: [
                {
                    question: "What does 'Chain of Thought' prompting encourage the model to do?",
                    options: ["Reply faster", "Show its reasoning steps", "Use more tokens", "Search the internet"],
                    correctIndex: 1
                },
                {
                    question: "What is a 'System Prompt'?",
                    options: ["A message from the user", "Initial instructions defining model behavior", "The output of the model", "The error log"],
                    correctIndex: 1
                }
            ]
        },
    },
    {
        id: 'llm-integration',
        type: 'skill',
        data: {
            id: 'llm-integration',
            title: 'LLM Integration',
            description: 'Using OpenAI SDK, Anthropic API, and Vercel AI SDK to stream responses.',
            tier: 'ai-engineer',
            category: 'ml',
            status: 'locked',
            prerequisites: ['node-runtime', 'typescript', 'python-core'],
            xpReward: 400,
            resources: [
                { label: 'Vercel AI SDK', url: 'https://sdk.vercel.ai/docs', type: 'article' },
                { label: 'Building Systems with ChatGPT', url: 'https://www.deeplearning.ai/short-courses/building-systems-with-chatgpt/', type: 'course' }
            ],
            quiz: [
                {
                    question: "Which feature allows meaningful partial responses before the full output is ready?",
                    options: ["Pagination", "Streaming", "Batching", "Caching"],
                    correctIndex: 1
                },
                {
                    question: "What role does 'temperature' play in LLM parameters?",
                    options: ["Controls speed", "Controls randomness/creativity", "Controls cost", "Controls memory usage"],
                    correctIndex: 1
                }
            ]
        },
    },
    {
        id: 'embeddings',
        type: 'skill',
        data: {
            id: 'embeddings',
            title: 'Embeddings & Latent Space',
            description: 'Understanding semantic search, contrastive loss, and high-dimensional spaces.',
            tier: 'ai-engineer',
            category: 'ml',
            status: 'locked',
            prerequisites: ['python-core', 'vector-db'],
            xpReward: 300,
            resources: [
                { label: 'Word2Vec Paper', url: 'https://arxiv.org/abs/1301.3781', type: 'paper' },
                { label: 'Embeddings: What are they?', url: 'https://vickiboykis.com/what_are_embeddings/', type: 'article' }
            ],
            quiz: [
                {
                    question: "If two words are semantically similar, their embeddings will be...",
                    options: ["Far apart", "Close together", "Orthogonal", "Zero"],
                    correctIndex: 1
                },
                {
                    question: "What is the result of 'King' - 'Man' + 'Woman' in vector space?",
                    options: ["Queen", "Prince", "Castle", "Knight"],
                    correctIndex: 0
                }
            ]
        },
    },
    {
        id: 'rag-arch',
        type: 'skill',
        data: {
            id: 'rag-arch',
            title: 'RAG Architecture',
            description: 'Retrieval Augmented Generation. Grounding LLMs with your own data.',
            tier: 'ai-engineer',
            category: 'ml',
            status: 'locked',
            prerequisites: ['llm-integration', 'vector-db', 'embeddings'],
            xpReward: 500,
            resources: [
                { label: 'DeepLearning.AI: RAG', url: 'https://www.deeplearning.ai/short-courses/retrieval-augmented-generation-engineers/', type: 'course' },
                { label: 'RAG Survey', url: 'https://arxiv.org/abs/2312.10997', type: 'paper' }
            ],
            quiz: [
                {
                    question: "What is the primary goal of RAG?",
                    options: ["To train a model from scratch", "To reduce latency", "To provide the model with external context", "To generate images"],
                    correctIndex: 2
                },
                {
                    question: "Where is the external knowledge usually retrieved from in RAG?",
                    options: ["The model weights", "A Vector Database", "The browser cache", "A blockchain"],
                    correctIndex: 1
                }
            ]
        },
    },
    {
        id: 'evals',
        type: 'skill',
        data: {
            id: 'evals',
            title: 'Model Evaluation',
            description: 'Benchmarking LLMs (MMLU, HumanEval) and RAG pipelines (RAGAS, Arize).',
            tier: 'ai-engineer',
            category: 'ml',
            status: 'locked',
            prerequisites: ['rag-arch'],
            xpReward: 350,
            resources: [
                { label: 'RAGAS Documentation', url: 'https://docs.ragas.io/en/stable/', type: 'article' },
                { label: 'Evaluating LLMs', url: 'https://www.youtube.com/watch?v=qc9s0Kj7bY4', type: 'video' }
            ],
            quiz: [
                {
                    question: "What is a common benchmark for general language understanding?",
                    options: ["MMLU", "ImageNet", "CIFAR-10", "MNIST"],
                    correctIndex: 0
                },
                {
                    question: "What does 'RAGAS' evaluate?",
                    options: ["Image generation quality", "RAG pipeline performance", "Server uptime", "Database speed"],
                    correctIndex: 1
                }
            ]
        },
    },
    {
        id: 'fine-tuning-peft',
        type: 'skill',
        data: {
            id: 'fine-tuning-peft',
            title: 'Fine-Tuning (PEFT/LoRA)',
            description: 'Parameter Efficient Fine-Tuning. Adapting models to specific domains cheaply.',
            tier: 'ai-engineer',
            category: 'ml',
            status: 'locked',
            prerequisites: ['llm-integration', 'python-core'],
            xpReward: 600,
            resources: [
                { label: 'LoRA Paper', url: 'https://arxiv.org/abs/2106.09685', type: 'paper' },
                { label: 'Fine-Tuning with HuggingFace', url: 'https://huggingface.co/docs/transformers/training', type: 'lab' }
            ],
            quiz: [
                {
                    question: "What does LoRA stand for?",
                    options: ["Low-Rank Adaptation", "Long-Range Attention", "Local Runtime API", "Large Optimization Rule"],
                    correctIndex: 0
                },
                {
                    question: "What is the main benefit of PEFT?",
                    options: ["Faster inference", "Lower compute/VRAM requirements for training", "Higher accuracy always", "No data needed"],
                    correctIndex: 1
                }
            ]
        },
    },

    // --- TIER 5: SYSTEMS & SPECIALIZATION ---
    {
        id: 'nextjs-app',
        type: 'skill',
        data: {
            id: 'nextjs-app',
            title: 'Next.js 15+',
            description: 'Server Actions, RSC, and Partial Prerendering.',
            tier: 'systems',
            category: 'frontend',
            status: 'locked',
            prerequisites: ['react-core', 'node-runtime', 'typescript'],
            xpReward: 300,
            resources: [
                { label: 'Next.js Learn', url: 'https://nextjs.org/learn', type: 'course' }
            ],
            quiz: [
                {
                    question: "What is a 'Server Action' in Next.js?",
                    options: ["A background cron job", "A function that runs on the server, callable from client", "A database migration", "A client-side event listener"],
                    correctIndex: 1
                },
                {
                    question: "What does RSC stand for?",
                    options: ["React Standard Component", "React Server Component", "Real Static Content", "Remote Service Call"],
                    correctIndex: 1
                }
            ]
        },
    },
    {
        id: 'ai-agents',
        type: 'skill',
        data: {
            id: 'ai-agents',
            title: 'Autonomous Agents',
            description: 'Building systems that can plan, use tools, and execute loops (LangGraph, AutoGPT).',
            tier: 'systems',
            category: 'ml',
            status: 'locked',
            prerequisites: ['rag-arch', 'prompt-eng'],
            xpReward: 1000,
            resources: [
                { label: 'Building Agents (DeepLearning.AI)', url: 'https://www.deeplearning.ai/short-courses/building-agentic-rag-with-llamaindex/', type: 'course' },
                { label: 'LangGraph Docs', url: 'https://python.langchain.com/docs/langgraph', type: 'article' },
                { label: 'ReAct Paper', url: 'https://arxiv.org/abs/2210.03629', type: 'paper' }
            ],
            quiz: [
                {
                    question: "In the ReAct pattern, what does the model alternate between?",
                    options: ["Reasoning and Acting", "Reading and Writing", "Rest and Activity", "Recall and Accuracy"],
                    correctIndex: 0
                },
                {
                    question: "What is the risk of an autonomous agent loop?",
                    options: ["It might get bored", "Infinite loops / spending too much money", "It stops using the GPU", "It becomes sentient"],
                    correctIndex: 1
                }
            ]
        },
    },
    {
        id: 'model-serving',
        type: 'skill',
        data: {
            id: 'model-serving',
            title: 'Model Serving & Quantization',
            description: 'Running local LLMs efficiently (vLLM, TGI, GGUF, AWQ, GPTQ).',
            tier: 'systems',
            category: 'devops',
            status: 'locked',
            prerequisites: ['fine-tuning-peft'],
            xpReward: 500,
            resources: [
                { label: 'vLLM Library', url: 'https://github.com/vllm-project/vllm', type: 'lab' },
                { label: 'Introduction to Quantization', url: 'https://huggingface.co/docs/optimum/concept_guides/quantization', type: 'article' }
            ],
            quiz: [
                {
                    question: "What does Quantization do to a model?",
                    options: ["Increases its size", "Reduces precision to save memory/compute", "Makes it reason better", "Converts it to Python"],
                    correctIndex: 1
                },
                {
                    question: "Which format is popular for running local LLMs on CPU/Mac?",
                    options: ["GGUF", "MP4", "EXE", "PNG"],
                    correctIndex: 0
                }
            ]
        },
    },
    {
        id: 'ai-safety',
        type: 'skill',
        data: {
            id: 'ai-safety',
            title: 'AI Safety & Ethics',
            description: 'Guardrails, hallucination detection, and alignment strategies.',
            tier: 'systems',
            category: 'ml',
            status: 'locked',
            prerequisites: ['ai-agents'],
            xpReward: 400,
            resources: [
                { label: 'NeMo Guardrails', url: 'https://github.com/NVIDIA/NeMo-Guardrails', type: 'lab' },
                { label: 'Constitution AI', url: 'https://arxiv.org/abs/2212.08073', type: 'paper' }
            ],
            quiz: [
                {
                    question: "What is 'Hallucination' in LLMs?",
                    options: ["Seeing ghosts", "Generating confident but incorrect information", "Crashing the server", "Deleting files"],
                    correctIndex: 1
                },
                {
                    question: "What is the purpose of 'Guardrails'?",
                    options: ["To speed up the model", "To prevent unsafe or off-topic outputs", "To improve grammar", "To visualize data"],
                    correctIndex: 1
                }
            ]
        },
    },
    {
        id: 'observability',
        type: 'skill',
        data: {
            id: 'observability',
            title: 'Observability & Tracing',
            description: 'OpenTelemetry, LangSmith, and logging for probabilistic systems.',
            tier: 'systems',
            category: 'devops',
            status: 'locked',
            prerequisites: ['evals'],
            xpReward: 300,
            resources: [
                { label: 'LangSmith', url: 'https://www.langchain.com/langsmith', type: 'article' },
                { label: 'OpenTelemetry.io', url: 'https://opentelemetry.io/docs/', type: 'article' }
            ],
            quiz: [
                {
                    question: "What is the main purpose of Observability in AI systems?",
                    options: ["To make the UI prettier", "To understand internal state from external outputs", "To compress the model", "To generate training data"],
                    correctIndex: 1
                },
                {
                    question: "Which pattern helps trace a request through multiple microservices or LLM calls?",
                    options: ["Distributed Tracing", "Load Balancing", "Unit Testing", "Code Linting"],
                    correctIndex: 0
                }
            ]
        },
    },
];


// --- AUTO-LAYOUT ALGORITHM ---
// Organized by Tier Level (Vertical)
// foundation: 0, frontend-2: 1, backend-data: 2, ai-engineer: 3, systems: 4

const TIER_LEVELS: Record<SkillTier, number> = {
    'foundation': 0,
    'frontend-2': 1,
    'backend-data': 2,
    'ai-engineer': 3,
    'systems': 4
};

export const getInitialSkills = (): SkillNode[] => {
    // 1. Group by Tier
    const nodesByTier: Record<number, SkillNode[]> = {};
    const skillMap = new Map<string, SkillNode>();

    // Create map for easy lookup
    RAW_SKILLS.forEach(skill => {
        // Clone to avoid mutating raw data if we run this multiple times
        const node = { ...skill, position: { x: 0, y: 0 } } as SkillNode;
        skillMap.set(node.id, node);

        const level = TIER_LEVELS[node.data.tier];
        if (!nodesByTier[level]) nodesByTier[level] = [];
        nodesByTier[level].push(node);
    });

    const positionedNodes: SkillNode[] = [];
    const Y_SPACING = -180;
    const X_SPACING = 240; // Increased spacing for larger titles

    // 2. Iterate Tiers 0 -> N
    const tiers = Object.keys(nodesByTier).map(Number).sort((a, b) => a - b);
    const nodeWeights = new Map<string, number>();

    tiers.forEach(level => {
        const nodes = nodesByTier[level];
        if (!nodes) return;

        // Barycenter Heuristic: Sort by average parent X position
        if (level > 0) {
            nodes.forEach(node => {
                const parents = node.data.prerequisites
                    .map(id => skillMap.get(id))
                    .filter(n => n && TIER_LEVELS[n.data.tier] < level); // Only look at parents in lower tiers

                let weight = 0;
                if (parents.length > 0) {
                    const avgX = parents.reduce((sum, p) => sum + (p?.position.x || 0), 0) / parents.length;
                    weight = avgX;
                } else {
                    // If no parents, keep roughly neutral or relative order
                    weight = 0;
                }
                nodeWeights.set(node.id, weight);
            });

            // Sort!
            nodes.sort((a, b) => {
                const weightA = nodeWeights.get(a.id) ?? 0;
                const weightB = nodeWeights.get(b.id) ?? 0;
                return weightA - weightB;
            });
        }

        // 3. Assign Positions (Centered)
        const count = nodes.length;
        const tierWidth = (count - 1) * X_SPACING;
        const startX = -tierWidth / 2;

        nodes.forEach((node, index) => {
            node.position = {
                x: startX + (index * X_SPACING),
                // Since Y_SPACING is negative (growing upwards), we start from bottom
                y: 600 + (level * Y_SPACING)
            };
            positionedNodes.push(node);
        });
    });

    return positionedNodes;
};

// Auto-generate edges based on prerequisites
export const INITIAL_EDGES: Edge[] = RAW_SKILLS.flatMap(skill =>
    skill.data.prerequisites.map(reqId => ({
        id: `e-${reqId}-${skill.id}`,
        source: reqId,
        target: skill.id,
        type: 'particle', // Use our custom animated edge
        animated: false,  // Custom edge handles animation
        style: { stroke: '#4b5563', strokeWidth: 2 },
    }))
);
