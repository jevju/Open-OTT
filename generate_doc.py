# import md_toc
#
# toc = md_toc.build_toc('doc/documentation.md')
#
# with open('doc/documentation.md', 'r+') as f:
#
#     doc = f.read()
#     doc = doc.replace('[TOC]', toc)
#
#     # print(doc)
#     f.seek(0)
#     f.write(doc)
#     f.truncate()


def generateTableOfContent(p):

    toc = []
    new_doc = []
    # new_doc = """ """

    with open(p, 'r+') as f:

        doc = f.readlines()

        for line in doc:
            if line.startswith('#'):

                try:
                    line = line.split('{#')[0]
                    # if not line.endswith('\n'):
                    #     line += '\n'

                    headingType = line.count('#')



                    toc_line = ""
                    tmp_line = line.replace('#', '').strip()
                    t = '\t'
                    b = '* '


                    for i in range(1, headingType):
                        toc_line += t

                    toc_line += b
                    toc_line += ('[' + tmp_line + ']')
                    toc_line += ('(' + tmp_line.replace(' ', '-').lower() + ')')
                    # print(toc_line)
                    toc_line += '\n'
                    toc.append(toc_line)
                except Exception as e:
                    print(e)

            new_doc.append(line)

        f.seek(0)
        f.write(""" """.join(new_doc).replace('[TOC]', """ """.join(toc)))
        f.truncate()

    # test = test.replace('[TOC]', """ """.join(toc))
    # print(test)

    #
    # idx = new_doc.index('[TOC]\n')
    #
    #
    #
    # print(idx)
    # print(new_doc)
                # print(l)
                # print('----------')

        # print(new_doc)





generateTableOfContent('doc/documentation.md')
