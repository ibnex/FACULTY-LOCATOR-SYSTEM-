# Faculty Locator System - API Documentation

Base URL:

http://localhost:5000/api/faculty

---

## 1. Search Faculty

### Request

GET /search?q=vivek

### Description

Performs fuzzy search on faculty names.

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

## 3. Faculty Details

### Request

GET /:id

### Description

Returns complete faculty information using faculty id.

---

## 4. Pagination

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

## 5. Popular Searches

### Request

GET /popular-searches

### Description

Returns top searched keywords.

---

## 6. Search Statistics

### Request

GET /search-stats

### Description

Returns overall search analytics.

---

## 7. Excel Import

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
