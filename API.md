**Is Alive**
----
  Simply returns true.

* **URL**

  /isalive

* **Method:**

  `GET`
  
*  **URL Params**

  None

* **Data Params**

  None

* **Success Response:**

  * **Code:** 200 
 
* **Error Response:**

  None
  

**Source**
----
  Gets the information needed by Integration Manager used to monitor the different folders specified in the configuration file.

* **URL**

  /source

* **Method:**

  `GET`
  
*  **URL Params**

  None

* **Data Params**

  None

* **Success Response:**

  * **Code:** 200 
 
* **Error Response:**

  None


**Actions**
----
  Gets a list of all available actions the monitor agent has being used as part of the monitor views in Integration Manager.

* **URL**

  /source

* **Method:**

  `GET`
  
*  **URL Params**

  None

* **Data Params**

  None

* **Success Response:**

  * **Code:** 200 
 
* **Error Response:**

  None


**Files Details Newest**
----
  Returns a list of the files (warning and error files) order by date ascending (newest files). Max result is 30 files.

* **URL**

  /FilesDetailsNewest?resourceName=:resourceName&applicationName=:applicationName&categoryName=:categoryName

* **Method:**

  `GET`
  
*  **URL Params**

   **Required:**
 
   `resourceName=[string]`<br />
   `applicationName=[string]`<br />
   `categoryName=[string]`

* **Data Params**

  None

* **Success Response:**

  * **Code:** 200 
 
* **Error Response:**

  * **Code:** 404 NOT FOUND

  OR

  * **Code:** 405 METHOD NOT ALLOWED


**Files Details Oldest**
----
  Returns a list of the files (warning and error files) order by date descending (oldest files). Max result is 30 files.

* **URL**

  /FilesDetailsNewest?resourceName=:resourceName&applicationName=:applicationName&categoryName=:categoryName

* **Method:**

  `GET`
  
*  **URL Params**

   **Required:**
 
   `resourceName=[string]`<br />
   `applicationName=[string]`<br />
   `categoryName=[string]`

* **Data Params**

  None

* **Success Response:**

  * **Code:** 200 
 
* **Error Response:**

  * **Code:** 404 NOT FOUND

  OR

  * **Code:** 405 METHOD NOT ALLOWED

**File Content**
----

**File Download**
----
  Downloads a file.

* **URL**

  /FileDownload?resourceName=:resourceName&applicationName=:applicationName&categoryName=:categoryName&identifier:filename

* **Method:**

  `GET`
  
*  **URL Params**

   **Required:**
 
   `resourceName=[string]`<br />
   `applicationName=[string]`<br />
   `categoryName=[string]`<br />
   `identifier=[string]`

* **Data Params**

  None

* **Success Response:**

  * **Code:** 200 
 
* **Error Response:**

  * **Code:** 400 Could not find file to download

  OR

  * **Code:** 405 METHOD NOT ALLOWED

**FileEdit**
----

**FileSave**
----
