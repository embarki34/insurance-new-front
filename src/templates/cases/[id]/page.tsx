import { useEffect, useState } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Card } from '@/components/ui/card'
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { FileText, Info } from "lucide-react"
import { Case, caseByIdResponse, PreLitigation as PreLitigationType, Litigation, event } from '@/lib/types'
import PreLitigation from './pre-litigation/page'
import Courts from './courts/page'
import JudicialCouncils from './judicial-councils/page'
import SupremeCourt from './supreme-court/page'
import Execution from './execution/page'
import { getCaseById, changeCaseStatus } from '@/data/cases.service'
import { getParameters } from '@/data/parameters.service'
import { Parameter, Value } from '@/lib/types'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'





function CasePage() {



    const [currentTab, setCurrentTab] = useState("notices")
    const id = useParams<{ id: string }>().id
    const [caseId, setCaseId] = useState<string | null>(null)
    const location = useLocation() as { state: Case }
    const [caseData, setCaseData] = useState<Case>(location.state)
    const [prelitigation, setPrelitigation] = useState<PreLitigationType[]>([])
    const [courts, setCourts] = useState<Litigation[]>([])
    const [judicialCouncils, setJudicialCouncils] = useState<Litigation[]>([])
    const [supremeCourt, setSupremeCourt] = useState<Litigation[]>([])
    const [execution, setExecution] = useState<Litigation[]>([])
    const [caseDatabyIdState, setCaseDatabyIdState] = useState<caseByIdResponse | null>(null)
    const [parameters, setParameters] = useState<Parameter[]>([])
    const [statusValues, setStatusValues] = useState<Value[]>([])
    const [changeStatusLock, setChangeStatusLock] = useState(false)
    const [newStatus, setNewStatus] = useState<string>("")
    const [refresh, setRefresh] = useState(false)
    const [events_prelitigation, setEvents_prelitigation] = useState<event[]>([])
    const [events_litigation_lv1, setEvents_litigation_lv1] = useState<event[]>([])
    const [events_litigation_lv2, setEvents_litigation_lv2] = useState<event[]>([])
    const [events_supreme_court, setEvents_supreme_court] = useState<event[]>([])







    useEffect(() => {



        if (caseData === null) {
            if (id) {
                getCaseById(id)
                    .then(response => {
                        if (response) {
                            setCaseData(response)
                        }
                    })
            }
        }


        if (id) {
            getCaseById(id)
                .then(response => {
                    if (response) {
                        setCaseDatabyIdState(response);
                        setCaseData(response)
                        const prelitigation = response.pre_litigations || [];
                        const litigations = response.litigations || [];
                        const litigations_lv1 = response.litigations_lv1 || [];
                        const litigations_lv2 = response.litigations_lv2 || [];
                        const events = response.events || [];
                        if (events.length > 0) {
                            const events_prelitigation = events.filter((event: event) => event.case_lvl === -1);
                            const events_litigation_lv1 = events.filter((event: event) => event.case_lvl === 0);
                            const events_litigation_lv2 = events.filter((event: event) => event.case_lvl === 1);
                            const events_supreme_court = events.filter((event: event) => event.case_lvl === 2);
                            setEvents_prelitigation(events_prelitigation)
                            setEvents_litigation_lv1(events_litigation_lv1)
                            setEvents_litigation_lv2(events_litigation_lv2)
                            setEvents_supreme_court(events_supreme_court)
                        }
                        setPrelitigation(prelitigation);
                        setCourts(litigations);
                        setJudicialCouncils(litigations_lv1);
                        setSupremeCourt(litigations_lv2);
                        setExecution(litigations_lv2);

                    } else {
                        console.error("No data received for case ID:", id);
                    }
                })
                .catch(error => {
                    console.error("Error fetching case data:", error);
                });
        }
    }, [id, refresh])

    useEffect(() => {
        const fetchParameters = async () => {
            try {
                const parametersData = await getParameters();
                setParameters(parametersData);
                const statusValues = parametersData.find(p => p.key === "حالة_الملف")?.values || [];
                setStatusValues(statusValues);
            } catch (error) {
                console.error("Error fetching parameters:", error);
            }
        };

        fetchParameters();
    }, [caseData]);

    // Function to determine badge color based on status
    const getStatusBadge = (status: string) => {
        // Remove underscores from status
        const formattedStatus = status.replace(/_/g, ' ')
        return (
            <Badge variant="destructive" className="bg-green-500/10 text-green-500 font-medium">
                {formattedStatus}
            </Badge>
        )
    }


    const changeStatus = async (id: string, newStatus: string) => {
        try {
            await changeCaseStatus(id, newStatus);
            setChangeStatusLock(!changeStatusLock)
            toast.success("تم تعديل الحالة بنجاح");
            setRefresh(!refresh)
        } catch (error) {
            toast.error("حدث خطأ أثناء تعديل الحالة");

        }
    }

    return (
        <div className="min-h-screen bg-background p-4 md:p-6" dir="rtl">
            <div className="max-w-8xl mx-auto space-y-6">

                {/* Main Case Information Card */}
                <Card className="shadow-md">
                    <CardHeader className="space-y-2">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <CardTitle className="text-2xl font-bold">
                                {caseData.title}
                            </CardTitle>
                            {getStatusBadge(caseData.status)}
                        </div>
                        <CardDescription className="text-muted-foreground">
                            رقم القضية: {caseData.file_number}
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <FileText className="h-5 w-5 text-primary" />
                                    <h3 className="font-semibold text-lg">معلومات القضية</h3>
                                </div>
                                <div className="space-y-3 bg-muted/30 p-4 rounded-md">
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground">نوع القضية:</span>
                                        <span className="font-medium">{caseData.case_type}</span>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground">رقم الملف:</span>
                                        <span className="font-medium">{caseData.file_number}</span>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground">رقم الصندوق:</span>
                                        <span className="font-medium">{caseData.box_number}</span>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground">سنة التسجيل:</span>
                                        <span className="font-medium">{caseData.registration_year}</span>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground">موضوع النزاع:</span>
                                        <span className="font-medium">{caseData.dispute_subject}</span>
                                    </div>
                                    <Separator />

                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground">المستخدم:</span>
                                        <span className="font-medium">{caseData.createdBy}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Info className="h-5 w-5 text-primary" />
                                    <h3 className="font-semibold text-lg">الأطراف</h3>
                                </div>
                                <div className="space-y-3 bg-muted/30 p-4 rounded-md">
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground">المدعي:</span>
                                        <span className="font-medium">{caseData.plaintiff}</span>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground">المدعى عليه:</span>
                                        <span className="font-medium">{caseData.defendant}</span>
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <h4 className="font-semibold mb-2">الوصف</h4>
                                    <div className="bg-muted/30 p-4 rounded-md">
                                        <p className="text-muted-foreground">
                                            {caseData.description}
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <h4 className="font-semibold mb-2">تغيير الحالة</h4>
                                    <div className="bg-muted/30 p-4 rounded-md flex items-center gap-2">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox id="terms2" onCheckedChange={() => setChangeStatusLock(!changeStatusLock)} checked={changeStatusLock} />
                                            <label
                                                htmlFor="terms2"
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                هل تريد تغيير الحالة؟
                                            </label>
                                        </div>

                                        <Select value={newStatus} onValueChange={(v) => setNewStatus(v)} disabled={!changeStatusLock}>
                                            <SelectTrigger className="flex-1 p-2 border border-muted rounded-md">
                                                <SelectValue placeholder={caseData.status} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {statusValues.map((status) => (
                                                    <SelectItem key={status.key} value={status.key} onClick={() => setNewStatus(status.key)} dir="rtl">
                                                        {status.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <Button variant="default" onClick={() => changeStatus(caseData.id, newStatus)} disabled={!changeStatusLock}>تأكيد</Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                {/* Tabs Section */}

                <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">


                    {/* this is the plase where the tabs are you can change the colors and evry style things */}
                    <TabsList className="w-full grid grid-cols-5 mb-6">
                        <TabsTrigger
                            value="execution"
                            className="flex items-center gap-2"
                        >
                            <span>ملفات التنفيذ</span>
                        </TabsTrigger>

                        <TabsTrigger
                            value="supreme-court"
                            className="flex items-center gap-2"
                        >
                            <span> المحكمة العليا و مجلس الدولة</span>
                        </TabsTrigger>

                        <TabsTrigger
                            value="judicial-councils"
                            className="flex items-center gap-2"
                        >
                            <span> المجالس القضائية أو المحاكم الإدارية الاستئنافية</span>
                        </TabsTrigger>

                        <TabsTrigger
                            value="courts"
                            className="flex items-center gap-2"
                        >
                            <span> مستوى  المحاكم </span>
                        </TabsTrigger>

                        <TabsTrigger
                            value="notices"
                            className="flex items-center gap-2 "
                        >
                            <span >الاعذارات</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* Tab Content */}
                    <div className="mt-6">
                        <TabsContent value="execution" className="space-y-4">
                            <div className="bg-muted/30 p-4 rounded-md">
                                {/* <h3 className="text-lg font-semibold mb-4">ملفات التنفيذ</h3> */}
                                <div className="text-muted-foreground">
                                    {/* Content placeholder for execution files */}
                                    <Execution execution={execution} />
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="supreme-court" className="space-y-4">
                            <div className="bg-muted/30 p-4 rounded-md">
                                {/* <h3 className="text-lg font-semibold mb-4">المحكمة العليا</h3> */}
                                <div className="text-muted-foreground">
                                    {/* Content placeholder for supreme court */}
                                    <SupremeCourt SupremeCourt={supremeCourt} onAdd={() => setRefresh(!refresh)} case_id={caseData.id} caseType={caseData.case_type} events={events_supreme_court}/>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="judicial-councils" className="space-y-4">
                            <div className="bg-muted/30 p-4 rounded-md">
                                {/* <h3 className="text-lg font-semibold mb-4">المجالس القضائية</h3> */}
                                <div className="text-muted-foreground">
                                    {/* Content placeholder for judicial councils */}
                                    <JudicialCouncils judicialCouncils={judicialCouncils} onAdd={() => setRefresh(!refresh)} case_id={caseData.id} caseType={caseData.case_type} events={events_litigation_lv2}/>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="courts" className="space-y-4">
                            <div className="bg-muted/30 p-4 rounded-md">
                                {/* <h3 className="text-lg font-semibold mb-4">النزاعات</h3> */}
                                <div className="text-muted-foreground">
                                    {/* Content placeholder for courts */}
                                    <Courts courts={courts} case_id={caseData.id} onAdd={() => setRefresh(!refresh)} onEdit={() => setRefresh(!refresh)} caseType={caseData.case_type} events={events_litigation_lv1}/>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="notices" className="space-y-4">
                            <div className="bg-muted/30 p-4 rounded-md">
                                {/* <h3 className="text-lg font-semibold mb-4">الاعذارات</h3> */}
                                <div className="text-muted-foreground">
                                    {/* Content placeholder for notices */}
                                    {/* <PreLitigation prelitigation={caseData.prelitigation} /> */}
                                    <PreLitigation prelitigation={prelitigation} case_id={caseData.id} onAdd={() => setRefresh(!refresh)} sender={caseData.plaintiff} resiver={caseData.defendant} box_number={caseData.box_number} file_number={caseData.file_number} events={events_prelitigation}  />


                                </div>
                            </div>
                        </TabsContent>
                    </div>
                </Tabs>

            </div>
        </div>
    )
}

export default CasePage