import React, {useEffect, useRef, useState} from 'react';
import ReactPDF, {Page, Text, View, Document, StyleSheet, Image, PDFViewer,renderToBuffer, PDFDownloadLink} from "@react-pdf/renderer";
import LogoGema from "../img/CompanyLogo.jpg";
import dayjs, { Dayjs } from "dayjs";
import { Button, Stack } from '@mui/material';

const styles = StyleSheet.create({
    mainContainer: {
        paddingTop: "5px",
        paddingBottom: "5px",
        paddingLeft: "5px",
        paddingRight: "5px",
    },
    border: {
        padding: "5px",
        border: "1px solid black",
        width: "100%",
        height: "100%"
    },
    logoImageContainer: {
        width: "100%",
        height: "10%",
    },
    logoImage: {
        width: "30%",
        margin: 0,
        padding: 0,
        boxSizing: "border-box",
    },
    section: {
        margin: 10,
        padding: 10,
        flexGrow: 1
    },
    docTitleContainer: {
        width: "100%",
        marginBottom: "10px",
        display: "flex",
        alignItems: "center",
    },
    fieldInfoContainer: {
        marginTop: "5px",
        marginBottom: "5px",
        display: "flex",
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
    },
    fieldInfoField: {
        width: "70%",
        padding: "5px",
        backgroundColor: "#CCC",
        border: "1px solid black"
    },
    fieldValue: {
        fontSize: "10px"
    },
    columnHeader: {
        border: "1px solid black",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-around",
        width: "90%",
        margin: "0 auto",
        marginTop: "10px",
    },
    columnHead: {
        backgroundColor: "#0283BDff",
        color: "white",
        padding: "5px",
        flex: 1
    },
    columnHeadText: {
        fontSize: "13px"
    },
    columnValueContainer: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-around",
        width: "90%",
        margin: "0 auto"
    },
    columnValue: {
        padding: "5px",
        flex: 1,
        border: "1px solid #ccc"
    },
    columnValueText: {
        fontSize: "10px"
    },
    mainContentContainer: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        flex: 1
    },
    conformeContainer: {
        width: "100%",
        fontSize: "10px",
        textAlign: "center"
    },
    pieFirma: {
        fontSize: "10px",
        marginTop: "30px",
        width: "100%",
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-evenly",
    },
    pieBorde: {
        fontSize: "10px",
        borderTop: "1px solid black",
        width: "100px",
        textAlign: "center",
        paddingTop: "5px"
    },
    pieInfo: {
        fontSize: "10px",
        display: "flex",
        flexDirection: "row",
        marginTop: "20px",
        marginLeft: "10px"
    },
    pieBordeInfo: {
        marginLeft: "15px",
        borderBottom: "1px solid black",
        width: "100px"
    }

})
const ColumnHeader = ({title}) => {
    return (
        <View style={styles.columnHead}>
            <Text style={styles.columnHeadText}>{title}</Text>
        </View>
    )
}
const TableHead = () => {
    return(
        <View style={styles.columnHeader}>
            <ColumnHeader title="Número"/>
            <ColumnHeader title="Fecha"/>
            <ColumnHeader title="Nro. Remito / Factura"/>
        </View>
    )
}
const ColumnValues = ({invoice}) => {
    return(
        <View style={styles.columnValueContainer}>
            <View style={styles.columnValue}>
                <Text style={styles.columnValueText}>{invoice.number}</Text>
            </View>
            <View style={styles.columnValue}>
                <Text style={styles.columnValueText}>{invoice.date}</Text>
            </View>
            <View style={styles.columnValue}>
                <Text style={styles.columnValueText}>{invoice.nroRemito}</Text>
            </View>
        </View>
    )
}
const Formulario = ({data}) => {

    return (
        <Document>
          <Page style={styles.mainContainer} size="A4">
              <View style={styles.border}>
                <View style={styles.logoImageContainer}>
                  <Image style={styles.logoImage} src={LogoGema}/>
                </View>
                <View style={styles.docTitleContainer}>
                  <Text>Rendición de documentación del cliente</Text>
                </View>
                <View style={styles.fieldInfoContainer}>
                    <View>
                        <Text style={styles.fieldValue}>Cliente: </Text>
                    </View>
                    <View style={styles.fieldInfoField}>
                        <Text style={styles.fieldValue}>{data.client}</Text>
                    </View>
                </View>
                <View style={styles.fieldInfoContainer}>
                    <View>
                        <Text style={styles.fieldValue}>Rendición nro: </Text>
                    </View>
                    <View style={styles.fieldInfoField}>
                        <Text style={styles.fieldValue}>{data.rendicionNro}</Text>
                    </View>
                </View>
                <View style={{...styles.fieldInfoContainer,marginBottom: "20px"}}>
                    <View>
                        <Text style={styles.fieldValue}>Fecha: </Text>
                    </View>
                    <View style={styles.fieldInfoField}>
                        <Text style={styles.fieldValue}>{data.date}</Text>
                    </View>
                </View>
                <TableHead/>
                <View style={styles.mainContentContainer}>
                    <View>
                        {
                            data.invoices.map((invoice)=><ColumnValues invoice={invoice}/>)
                        }
                    </View>
                    <View>
                        <View style={styles.conformeContainer}>
                            <Text>Recibi conforme la documentación edtallada en el presente documento</Text>
                        </View>
                        <View style={styles.pieFirma}>
                            <Text style={styles.pieBorde}>Firma y aclaración</Text>
                            <Text style={styles.pieBorde}>DNI</Text>
                        </View>
                        <View style={{...styles.pieInfo, marginTop: "40px"}}>
                            <Text>Entregado por:</Text>
                            <View style={styles.pieBordeInfo}></View>
                        </View>
                        <View style={{...styles.pieInfo, marginBottom: "20px"}}>
                            <Text>Fecha de entrega: </Text>
                            <Text style={styles.pieBordeInfo}></Text>
                        </View>
                    </View>
                </View>
              </View>
          </Page>
        </Document>
    )
}
export const RendicionPdf = ({cancel,data,confirmarChequeo}) => {
    const [pdfData,setPdfData] = useState(data);
    useEffect(() => {
        setPdfData(data);
    },[data]);
    return(
        <>
            <PDFViewer showToolbar={true} height="97%" width="600px">
                <Formulario data={pdfData}/>
            </PDFViewer>
            <PDFDownloadLink document={<Formulario data={pdfData}/>} fileName="rendicion.pdf">
                {
                    ({blob,url,loading,error})=>loading ? <Button disabled sx={{marginTop: 2}} variant="contained" color="secondary">Cargando</Button> : <Button sx={{marginTop: 2}} variant="contained" color="secondary">Descargar PDF</Button>
                }
            </PDFDownloadLink>
            <Stack sx={{marginTop: 4}} direction="row" spacing={1}>
                <Button onClick={confirmarChequeo} color="primary" variant="contained">Confirmar</Button>
                <Button onClick={cancel} color="error" variant="outlined">Cancelar</Button>
            </Stack>
        </>
    )
}
