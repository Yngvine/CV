import subprocess
from docxtpl import DocxTemplate, InlineImage
import win32com.client
from docx.shared import Mm


def fill_resume_docx(template_path, output_docx, data):
    doc = DocxTemplate(template_path)
    # Example with image insertion:
    if "profile_picture" in data["personal_information"]:
        img = InlineImage(doc, data["personal_information"]["profile_picture"], width=Mm(29.4))
        data["personal_information"]["picture_inline"] = img
    data["personal_interests_listed"] = ', '.join(data["personal_interests"])
    doc.render(data)
    doc.save(output_docx)

def update_doc_with_toc(output_docx):

    # Update ToC
    word = win32com.client.Dispatch("Word.Application")
    word.Visible = False
    abs_path = os.path.abspath(output_docx)
    doc = word.Documents.Open(abs_path)
    doc.Fields.Update()
    doc.Save()
    doc.Close()
    word.Quit()

def fill_projects_docx(template_path, output_docx, data):
    doc = DocxTemplate(template_path)
    # Example with image insertion:
    data['project_types'] = []
    for project in data["projects"]:
        
        if "images" in project:
            img = InlineImage(doc, project["images"][0], height=Mm(float(project["word_info"]["img_height"][:-2])))
            project["img_header"] = img
        
        if project["status"] != "future" and "skills" in project:
            project['skills_listed'] = ', '.join(project["skills"])
            project['links_listed'] = ', '.join(project["links"])
        if project["type"].capitalize() not in set([p["name"] for p in data['project_types']]):
            data['project_types'].append({"name": project["type"].capitalize(), "projects": [project]})
        else:
            for p in data['project_types']:
                if p["name"] == project["type"].capitalize():
                    p["projects"].append(project)

    doc.render(data)
    doc.save(output_docx)


def convert_to_pdf(docx_path, pdf_path, method="libreoffice"):
    if method == "libreoffice":
        subprocess.run([
            "soffice", "--headless", "--convert-to", "pdf", 
            "--outdir", pdf_path.rsplit("/", 1)[0], docx_path
        ], check=True)
    elif method == "docx2pdf":
        from docx2pdf import convert
        convert(docx_path)
    else:
        raise ValueError("Unknown method")

if __name__ == "__main__":
    import json, os
    with open("CV.json", encoding="utf-8") as f:
        data = json.load(f)
    # Fill resume
    #fill_resume_docx("Resume_template.docx", "filled_resume.docx", data)
    fill_projects_docx("Projects_template.docx", "filled_projects.docx", data)
    update_doc_with_toc("filled_projects.docx")
    print("Done.")
