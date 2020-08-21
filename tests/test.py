from selenium import webdriver
from selenium.common.exceptions import NoSuchElementException
from selenium.webdriver.chrome.options import Options
import time
import os

options = Options()

options.add_argument('--ignore-ssl-errors=yes')
options.add_argument('--ignore-certificate-errors')
options.add_argument('--headless')
options.add_argument('--no-sandbox')

driver = browser = webdriver.Chrome(options=options)

testCaseName = os.environ["testCase"]
ip = os.environ["serverIP"]

# Get login header Electronic Medical Records
def tc001():
    driver.get(f"https://{ip}")
    time.sleep(2.5)

    title = driver.find_element_by_tag_name("h1")

    assert title.text == "Electronic Medical Records", "Wrong header text"
    driver.quit()


# Upload drug list
def tc002():
    driver.get(f"https://{ip}/master/drug-list")
    time.sleep(2.5)

    file = driver.find_element_by_xpath("//*[@id='form1']/div[1]/div/div[1]/input")
    uploadBtn = driver.find_element_by_xpath("//*[@id='form1']/div[2]/a")

    file.send_keys(f"{os.getcwd()}/drugList.xlsx")
    uploadBtn.click()

    time.sleep(2.5)

    confirmBtn = driver.find_element_by_xpath("//*[@id='modal1']/div[2]/button[2]")
    confirmBtn.click()

    time.sleep(2)

    try:
        uploadCheck = driver.find_element_by_xpath("//*[@id='biography']/a")
        assert 1 == 0, "Excel drug list upload was not successful"
    except NoSuchElementException:
        print("File was uploaded successfully")

    driver.quit()

# Check title
def tc003():
    driver.get(f"https://{ip}")
    time.sleep(2.5)

    title = driver.title
    assert title == "Educational Electronic Medical Records", "Wrong title text"
    driver.quit()


def runTest(tc):

    print(f"Executing {tc}")
    eval(f"{tc}()")
    print(f"Finished Execution of {tc}")


runTest(testCaseName)


