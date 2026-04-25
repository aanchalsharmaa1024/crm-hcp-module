from langchain_groq import ChatGroq
from langchain.agents import AgentExecutor, create_tool_calling_agent
from langchain_core.prompts import ChatPromptTemplate
from dotenv import load_dotenv
import os
from app.agent.tools import (
    log_interaction,
    edit_interaction,
    search_hcp,
    schedule_followup,
    recommend_next_action
)

load_dotenv()

tools = [
    log_interaction,
    edit_interaction,
    search_hcp,
    schedule_followup,
    recommend_next_action
]

llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    api_key=os.getenv("GROQ_API_KEY"),
    temperature=0
)

prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a helpful CRM assistant for pharmaceutical sales reps. Help them log and manage HCP interactions."),
    ("human", "{input}"),
    ("placeholder", "{agent_scratchpad}"),
])

agent = create_tool_calling_agent(llm, tools, prompt)
crm_agent = AgentExecutor(agent=agent, tools=tools, verbose=True)