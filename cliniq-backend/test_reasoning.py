import os
from dotenv import load_dotenv
from agents.query_agent import run_nl_query

load_dotenv()

def print_header(title):
    print("\n" + "="*50)
    print(f" {title.upper()}")
    print("="*50 + "\n")

def run_tests():
    print_header("Test 1: Multi-Step Reasoning (> 2 sequential decisions)")
    # The agent must:
    # 1. get_patient_case_sheet (fetch patient)
    # 2. extract_lab_trends (fetch HbA1c)
    # 3. check_drug_interactions (fetch interactions for med list)
    prompt_1 = "Can you look up patient P-00142, tell me their HbA1c trends over the last 6 months, and check if their current medications have any dangerous drug interactions?"
    print(f"Prompt: {prompt_1}\n")
    response_1 = run_nl_query(prompt_1, "P-00142")
    print(f"Respnse:\n{response_1}\n")

    print_header("Test 2: Edge Case Handling (Missing Data)")
    prompt_2 = "Can you check the case sheet and lab trends for patient P-99999?"
    print(f"Prompt: {prompt_2}\n")
    response_2 = run_nl_query(prompt_2, "P-99999")
    print(f"Respnse:\n{response_2}\n")

if __name__ == "__main__":
    run_tests()
