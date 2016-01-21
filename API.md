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
