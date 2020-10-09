const router = require('express').Router();
const tables = require('../db/tables');
const db = require('../db/database').getDatabase();
const { validateDepartment, validateTeaches } = require('../db/models');

router.get("/", (req, res) => {
    const sqlQuery = `SELECT * FROM ${tables.tableNames.department}`;
    db.all(sqlQuery, (err, rows) => {
        if (err) {
            console.log(err);
            return res.status(500).send({
                message: "An error occurred"
            });
        }
        // res.send(rows);
        res.render("../FrontEnd/departments.ejs", { departments: rows });
    });
});

router.get("/:name/instructors/create", (req, res) => {
    const name = req.params.name;
    res.render('../FrontEnd/addInstructorToDept.ejs', { name: name });
});

router.get("/create", (req, res) => {
    res.render('../FrontEnd/createDepartment.ejs');
});

router.get("/:name", (req, res) => {
    // Adding COLLATE NOCASE makes the queries case insensitive.
    const sqlQuery = `SELECT * FROM ${tables.tableNames.department} WHERE ${tables.deptColumns.deptName} = ? COLLATE NOCASE`;
    db.get(sqlQuery, [req.params.name], (err, rows) => {
        if (err) {
            console.log(err);
            return res.status(500).send({
                message: "An error occurred"
            });
        }
        if (!rows) {
            return res.status(404).send({
                message: "A department with the requested name was not found."
            });
        }
        // res.send(rows);
        res.render("../FrontEnd/departmentByName.ejs", { department: rows });
    });
});


router.get("/:name/instructors", (req, res) => {
    // Adding COLLATE NOCASE makes the queries case insensitive.
    const sqlQuery = `
    SELECT * FROM ${tables.tableNames.instructor}
    WHERE ${tables.instructorColumns.department_name} = ? COLLATE NOCASE`

    db.all(sqlQuery, [req.params.name], (err, rows) => {
        if (err) {
            console.log(err);
            return res.status(500).send({
                message: "An error occurred"
            });
        }
        if (!rows) {
            return res.status(404).send({
                message: "Instructors for the requested department name could not be found."
            });
        }
        // res.send(rows);
        res.render("../FrontEnd/deptInstructors.ejs", { instructors: rows });
    });
});


router.get("/:name/students", (req, res) => {
    // Adding COLLATE NOCASE makes the queries case insensitive.
    const sqlQuery = `
    SELECT * FROM ${tables.tableNames.student}
    WHERE ${tables.studentColumns.department_name} = ? COLLATE NOCASE`

    db.get(sqlQuery, [req.params.name], (err, rows) => {
        if (err) {
            console.log(err);
            return res.status(500).send({
                message: "An error occurred"
            });
        }
        if (!rows) {
            return res.status(404).send({
                message: "Students for the requested department name could not be found."
            });
        }
        // res.send(rows);
        res.render("../FrontEnd/deptStudents.ejs", { student: rows });
    });
});


router.post("/", (req, res) => {
    console.log("Request to post department received.")
    const { error } = validateDepartment(req.body);
    if (error) {
        return res.status(400).send({
            message: error.details[0].message
        });
    }

    const deptName = req.body.deptName;
    const building = req.body.building;
    const budget = req.body.budget;
    const sqlQuery = `
    INSERT INTO ${tables.tableNames.department}
    (deptName, building, budget)
    VALUES ('${deptName}', '${building}', ${budget})`

    db.run(sqlQuery, (err) => {
        if (err) {
            console.log(err);
            return res.status(500).send({
                message: "An error occured while trying to save the department details"
            });
        }
        res.redirect("/departments");
    });
});

router.post("/:name/delete", (req, res) => {
    const sqlQuery = `
    DELETE FROM ${tables.tableNames.department}
    WHERE ${tables.deptColumns.deptName} = ?
    COLLATE NOCASE`

    db.run(sqlQuery, [req.params.name], (err) => {
        if (err) {
            return res.status(500).send({
                message: "An error occurred while trying to delete this department"
            });
        }
        res.redirect("/departments");
    })
})


router.post("/:name/instructors", (req, res) => {
    const { error } = validateTeaches(req.body);
    if (error) {
        return res.status(400).send({
            message: error.details[0].message
        });
    }

    const insId = req.body.instructor_id;
    const secId = req.body.section_id;
    const sqlQuery = `
    INSERT INTO ${tables.tableNames.teaches}
    (${tables.teachesColumns.instructor_id}, ${tables.teachesColumns.section_id})
    VALUES (${insId}, ${secId})`;

    db.run(sqlQuery, (err) => {
        if (err) {
            console.log(err);
            return res.status(500).send({
                message: "An error occured while trying to save the instructor relation"
            });
        }
        res.redirect(`/departments/${req.params.name}/instructors`);
    });
});

router.delete("/:name", (req, res) => {
    const sqlQuery = `
    DELETE FROM ${tables.tableNames.department}
    WHERE ${tables.deptColumns.deptName} = ?
    COLLATE NOCASE`

    db.run(sqlQuery, [req.params.name], (err) => {
        if (err) {
            return res.status(500).send({
                message: "An error occurred while trying to delete this department"
            });
        }
        res.send({
            message: "Department deleted successfully"
        });
    });
})

module.exports = router;
