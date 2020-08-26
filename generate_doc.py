
import md_toc





res = md_toc.build_toc('doc/documentation.md')
with open('doc/toc.md', 'w') as f:

    # doc = f.read()
    #
    # print(doc)

    f.write(res)
