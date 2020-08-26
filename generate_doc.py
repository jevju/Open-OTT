import md_toc

toc = md_toc.build_toc('doc/documentation.md')

with open('doc/documentation.md', 'r+') as f:

    doc = f.read()
    doc = doc.replace('[TOC]', toc)

    # print(doc)
    f.seek(0)
    f.write(doc)
    f.truncate()
