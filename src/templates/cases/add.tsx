"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Loader2, Check, FileText, User, Book, BoxSelect, CalendarDays } from "lucide-react"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { getParameters } from "@/data/parameters.service"
import { Value, Parameter, caseInput } from "@/lib/types"
import { createCase } from "@/data/cases.service"



const AddCase = ({ onAdd, }: { onAdd: () => void }) => {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentTab, setCurrentTab] = useState("basic")
  const [allParameters, setAllParameters] = useState<Parameter[]>([])
  const [campaigns, setCampaigns] = useState<Value[]>([])
  const [statuses, setStatuses] = useState<Value[]>([])
  const [caseTypes, setCaseTypes] = useState<Value[]>([])
  const [caseData, setCaseData] = useState<caseInput>({
    title: "",
    description: "",
    case_type: "",
    status: "",
    box_number: "",
    file_number: "",
    registration_year: new Date().getFullYear(),
    plaintiff: "",
    defendant: "",
    dispute_subject: "",
    updatedBy: "system"
  })

  const [autoPlaintiff, setAutoPlaintiff] = useState(false)
  const [autoDefendant, setAutoDefendant] = useState(false)

  useEffect(() => {
    if (autoPlaintiff) {
      setCaseData(prev => ({ ...prev, plaintiff: "CONDOR" }))
      setAutoDefendant(false)
    } else if (caseData.plaintiff === "CONDOR") {
      setCaseData(prev => ({ ...prev, plaintiff: "" }))
    }
  }, [autoPlaintiff])

  useEffect(() => {
    if (autoDefendant) {
      setCaseData(prev => ({ ...prev, defendant: "CONDOR" }))
      setAutoPlaintiff(false)
    } else if (caseData.defendant === "CONDOR") {
      setCaseData(prev => ({ ...prev, defendant: "" }))
    }
  }, [autoDefendant])


  useEffect(() => {
    const fetchParameters = async () => {
      try {
        const parameters = await getParameters();
        setAllParameters(parameters); // good to store for later use

        const campaignValues = parameters.find(p => p.key === "الشركات_التابعة")?.values || [];
        const statusValues = parameters.find(p => p.key === "حالة_الملف")?.values || [];
        const caseTypeValues = parameters.find(p => p.key === "نوع_القضية")?.values || [];



        setCampaigns(campaignValues);
        setStatuses(statusValues);
        setCaseTypes(caseTypeValues);
      } catch (error) {
        console.error("Error fetching parameters:", error);
      }
    };

    fetchParameters();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setCaseData(prev => ({ ...prev, [id]: value }))
  }

  const handleSelectChange = (id: string, value: string) => {
    setCaseData(prev => ({ ...prev, [id]: value }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Replace with your actual API call

      await createCase(caseData)
      toast.success("تمت إضافة القضية بنجاح")
      setOpen(false)
      resetForm()
      onAdd()
    } catch (error) {
      console.error("Error creating case:", error)
      toast.error("حدث خطأ أثناء إضافة القضية")
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setCaseData({
      title: "",
      description: "",
      case_type: "",
      status: "Open",
      box_number: "",
      file_number: "",
      registration_year: new Date().getFullYear(),
      plaintiff: "",
      defendant: "",
      dispute_subject: "",
      updatedBy: "system"
    })
    setAutoPlaintiff(false)
    setAutoDefendant(false)
    setCurrentTab("basic")
  }

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (!isOpen) resetForm()
  }

  const isFormValid = () => {
    return caseData.title && caseData.file_number
  }

  return (
    <div className="flex items-center justify-end space-x-reverse" dir="rtl">
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button className="bg-primary hover:bg-primary/90 transition-colors">
            <Plus className="mr-2 h-4 w-4" />
            إضافة قضية جديدة
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto p-6 bg-background shadow-lg rounded-lg" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center mb-4">إضافة قضية جديدة</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
              <TabsList className="w-full grid grid-cols-3 mb-6">

                <TabsTrigger value="filing" className="flex items-center gap-2">
                  <Book className="h-4 w-4" />
                  <span>معلومات الملف</span>
                </TabsTrigger>



                <TabsTrigger value="parties" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>أطراف النزاع</span>
                </TabsTrigger>
                <TabsTrigger value="basic" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>معلومات أساسية</span>
                </TabsTrigger>

              </TabsList>

              <TabsContent value="basic" className="mt-0">
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4" dir="rtl">
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <Label htmlFor="title" className="text-sm font-medium mb-1 block">عنوان القضية *</Label>
                          <Input
                            id="title"
                            value={caseData.title}
                            onChange={handleChange}
                            required
                            placeholder="أدخل عنوان القضية"
                            className="transition-all focus-visible:ring-primary"
                          />
                        </div>

                        <div>
                          <Label htmlFor="description" className="text-sm font-medium mb-1 block">الوصف</Label>
                          <textarea
                            id="description"
                            value={caseData.description}
                            onChange={handleChange}
                            placeholder="أدخل وصف القضية"
                            className="flex h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all resize-none"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="case_type" className="text-sm font-medium mb-1 block">نوع القضية</Label>
                            <Select value={caseData.case_type} onValueChange={(v) => handleSelectChange("case_type", v)}>
                              <SelectTrigger className="transition-all focus-visible:ring-primary">
                                <SelectValue placeholder="اختر نوع القضية" />
                              </SelectTrigger>


                              <SelectContent>
                                {caseTypes.map((type) => (
                                  <SelectItem key={type.key} value={type.key} dir="rtl">
                                    {type.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div dir="rtl">
                            <Label htmlFor="status" className="text-sm font-medium mb-1 block">الحالة</Label>
                            <Select value={caseData.status} onValueChange={(v) => handleSelectChange("status", v)}>
                              <SelectTrigger className="transition-all focus-visible:ring-primary">
                                <SelectValue placeholder="اختر الحالة" />
                              </SelectTrigger>


                              <SelectContent>
                                {statuses.map((status) => (
                                  <SelectItem key={status.key} value={status.key} dir="rtl">
                                    {status.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="parties" className="mt-0">
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4" dir="rtl">


                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="plaintiff" className="text-sm font-medium">
                            المدعي
                          </Label>
                          <div className="flex items-center gap-2">
                            <Checkbox
                              checked={autoPlaintiff}
                              onCheckedChange={(checked) => {
                                setAutoPlaintiff(checked === true);
                                if (!checked) {
                                  setCaseData(prev => ({ ...prev, plaintiff: "" }));
                                }
                                setAutoDefendant(false);
                              }}
                              disabled={autoDefendant}
                            />
                            <Label className="text-sm">شركة تابعة</Label>
                          </div>
                        </div>

                        {autoPlaintiff ? (
                          <Select
                            value={caseData.plaintiff}
                            onValueChange={(value) => handleSelectChange("plaintiff", value)}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="اختر الشركة" />
                            </SelectTrigger>
                            <SelectContent>
                              {campaigns.map((company) => (
                                <SelectItem key={company.key} value={company.key}>
                                  {company.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            id="plaintiff"
                            value={caseData.plaintiff}
                            onChange={(e) => handleChange(e)}
                            className="w-full"
                          />
                        )}
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="defendant" className="text-sm font-medium">
                            المدعى عليه
                          </Label>
                          <div className="flex items-center gap-2">
                            <Checkbox
                              checked={autoDefendant}
                              onCheckedChange={(checked) => {
                                setAutoDefendant(checked === true);
                                if (!checked) {
                                  setCaseData(prev => ({ ...prev, defendant: "" }));
                                }
                                setAutoPlaintiff(false);
                              }}
                              disabled={autoPlaintiff}
                            />
                            <Label className="text-sm">شركة تابعة</Label>
                          </div>
                        </div>

                        {autoDefendant ? (
                          <Select
                            value={caseData.defendant}
                            onValueChange={(value) => handleSelectChange("defendant", value)}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="اختر الشركة" />
                            </SelectTrigger>
                            <SelectContent>
                              {campaigns.map((company) => (
                                <SelectItem key={company.key} value={company.key}>
                                  {company.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            id="defendant"
                            value={caseData.defendant}
                            onChange={(e) => handleChange(e)}
                            className="w-full"
                          />
                        )}
                      </div>

                      <div>
                        <Label htmlFor="dispute_subject" className="text-sm font-medium mb-1 block">موضوع النزاع</Label>
                        <Input
                          id="dispute_subject"
                          value={caseData.dispute_subject}
                          onChange={handleChange}
                          placeholder="أدخل موضوع النزاع"
                          className="transition-all focus-visible:ring-primary"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="filing" className="mt-0">
                <Card>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6" dir="rtl">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <BoxSelect className="h-4 w-4 text-muted-foreground" />
                          <Label htmlFor="box_number" className="text-sm font-medium">رقم الصندوق</Label>
                        </div>
                        <Input
                          id="box_number"
                          value={caseData.box_number}
                          onChange={handleChange}
                          placeholder="أدخل رقم الصندوق"
                          className="transition-all focus-visible:ring-primary"
                        />
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <Label htmlFor="file_number" className="text-sm font-medium">رقم الملف *</Label>
                        </div>
                        <Input
                          id="file_number"
                          value={caseData.file_number}
                          onChange={handleChange}
                          required
                          placeholder="أدخل رقم الملف"
                          className="transition-all focus-visible:ring-primary"
                        />
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="h-4 w-4 text-muted-foreground" />
                          <Label htmlFor="registration_year" className="text-sm font-medium">سنة التسجيل</Label>
                        </div>
                        <Input
                          type="number"
                          id="registration_year"
                          value={caseData.registration_year}
                          onChange={handleChange}
                          min="2000"
                          max={new Date().getFullYear()}
                          className="transition-all focus-visible:ring-primary"
                        />
                      </div>


                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="flex justify-between pt-2">
              <div>
                {currentTab !== "basic" && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentTab(currentTab === "parties" ? "basic" : "parties")}
                    className="gap-2"
                  >
                    السابق
                  </Button>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="min-w-24"
                >
                  إلغاء
                </Button>

                {currentTab !== "filing" ? (
                  <Button
                    type="button"
                    onClick={() => setCurrentTab(currentTab === "basic" ? "parties" : "filing")}
                    className="bg-primary hover:bg-primary/90 min-w-24 transition-colors"
                  >
                    التالي
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    className="bg-primary hover:bg-primary/90 min-w-32 transition-colors"
                    disabled={isSubmitting || !isFormValid()}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        جاري الحفظ...
                      </>
                    ) : (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        حفظ القضية
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AddCase