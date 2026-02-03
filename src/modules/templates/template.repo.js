import { db } from '../../services/database.js';

// יצירת Template עם שאלות
export async function createTemplate(template) {
	const conn = await db.getConnection();
	try {
		await conn.beginTransaction();

		// הוספת template
		const [templateResult] = await conn.query(
			`INSERT INTO treatment_templates
			 (treatment_type_id, name, description, template_type, version, is_active)
			 VALUES (?, ?, ?, ?, ?, ?)`,
			[
				template.treatment_type_id,
				template.name,
				template.description,
				template.template_type,
				template.version ?? '1.0',
				template.is_active ?? 1
			]
		);

		const templateId = templateResult.insertId;

		// הוספת שאלות (אם יש)
		if (Array.isArray(template.questions)) {
			for (const q of template.questions) {
				await conn.query(
					`INSERT INTO template_questions
					 (template_id, question_text, question_type, is_required, order_index, visible_to)
					 VALUES (?, ?, ?, ?, ?, ?)`,
					[
						templateId,
						q.question_text,
						q.question_type,
						q.is_required ?? 0,
						q.order_index ?? 0,
						q.visible_to ?? 'therapist'
					]
				);
			}
		}

		await conn.commit();
		return { templateId };

	} catch (err) {
		await conn.rollback();
		throw err;
	} finally {
		conn.release();
	}
}

// עדכון Template + שאלות (גישה פשוטה: מוחקים שאלות ומכניסים מחדש)
export async function updateTemplate(templateId, data) {
	const conn = await db.getConnection();
	try {
		await conn.beginTransaction();

		// עדכון template
		await conn.query(
			`UPDATE treatment_templates
			 SET name = ?, description = ?, is_active = ?
			 WHERE template_id = ?`,
			[
				data.name,
				data.description,
				data.is_active ?? 1,
				templateId
			]
		);

		// מחיקת שאלות קיימות
		await conn.query(
			`DELETE FROM template_questions WHERE template_id = ?`,
			[templateId]
		);

		// הכנסת שאלות מחדש
		if (Array.isArray(data.questions)) {
			for (const q of data.questions) {
				await conn.query(
					`INSERT INTO template_questions
					 (template_id, question_text, question_type, is_required, order_index, visible_to)
					 VALUES (?, ?, ?, ?, ?, ?)`,
					[
						templateId,
						q.question_text,
						q.question_type,
						q.is_required ?? 0,
						q.order_index ?? 0,
						q.visible_to ?? 'therapist'
					]
				);
			}
		}

		await conn.commit();
		return { success: true };

	} catch (err) {
		await conn.rollback();
		throw err;
	} finally {
		conn.release();
	}
}

// שליפה מלאה (Template + Questions)
export async function getTemplateById(templateId) {
	const [rows] = await db.query(
		`
		SELECT
			t.template_id,
			t.name,
			t.description,
			t.template_type,
			q.question_id,
			q.question_text,
			q.question_type,
			q.is_required,
			q.order_index,
			q.visible_to
		FROM treatment_templates t
		LEFT JOIN template_questions q
			ON q.template_id = t.template_id
		WHERE t.template_id = ?
		ORDER BY q.order_index
		`,
		[templateId]
	);

	if (!rows.length) return null;

	return {
		template_id: rows[0].template_id,
		name: rows[0].name,
		description: rows[0].description,
		template_type: rows[0].template_type,
		questions: rows
			.filter(r => r.question_id)
			.map(r => ({
				question_id: r.question_id,
				question_text: r.question_text,
				question_type: r.question_type,
				is_required: r.is_required,
				order_index: r.order_index,
				visible_to: r.visible_to
			}))
	};
}
