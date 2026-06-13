# Faculty Locator System - API Documentation

Base URL:

http://localhost:5000/api/faculty

---

## 1. Search Faculty

### Request

GET /search?q=vivek

### Description

Performs fuzzy search on faculty names and keywords.

### Example

GET /api/faculty/search?q=anirudh

---

## 2. Autocomplete Suggestions

### Request

GET /suggestions?q=vi

### Description

Returns faculty suggestions while typing.

### Example Response

[
{
"name": "Dr. Vivek V",
"department": "Alliance School of Advanced Computing"
}
]

---

## 3. Get All Departments

### Request

GET /departments

### Description

Returns all unique departments available in the database.

---

## 4. Get Faculty By Department

### Request

GET /department/:department

### Example

GET /department/Alliance%20School%20of%20Advanced%20Computing

### Description

Returns all faculty belonging to a specific department.

---

## 5. Faculty Details

### Request

GET /:id

### Description

Returns complete faculty information using faculty id.

---

## 6. Filter Faculty

### Request

GET /filter

### Query Parameters

department

designation

### Example

GET /filter?department=Alliance School of Advanced Computing

GET /filter?designation=Professor

GET /filter?department=Alliance School of Advanced Computing&designation=Professor

---

## 7. Pagination

### Request

GET /?page=1&limit=20

### Description

Returns paginated faculty records.

### Example Response

{
"page": 1,
"limit": 20,
"total": 410,
"totalPages": 21
}

---

## 8. Popular Searches

### Request

GET /popular-searches

### Description

Returns top searched keywords.

---

## 9. Search Statistics

### Request

GET /search-stats

### Description

Returns overall search analytics.

---

## 10. Excel Import

### Request

POST /import-excel

### Content Type

multipart/form-data

### Description

Uploads Excel file and updates faculty room, floor and cabin information.

---

## Database Fields

Faculty

* name
* department
* designation
* qualification
* photo
* profileUrl
* floorNumber
* roomNumber
* cabinNumber
* keywords

---

## Technologies Used

* Node.js
* Express.js
* MongoDB Atlas
* Mongoose
* Fuse.js
* Axios
* Cheerio
* Multer
* XLSX
