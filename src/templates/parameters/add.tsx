"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { createParameter, getParameters } from "@/data/parameters.service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Loader2, X, AlertCircle, Check } from "lucide-react"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"

const AddParameter = ({ onAdd }: { onAdd: (response: any) => void }) => {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [availableParameters, setAvailableParameters] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  // Main parameter data
  const [paramData, setParamData] = useState({
    key: "",
    label: "",
    values: [],
    updatedBy: "system",
    allowLinkedParams: false,
  })

  // Temporary state for a new value being added
  const [newValue, setNewValue] = useState({
    key: "",
    label: "",
    hasDependencies: false,
    linked_params: [],
  })

  // State for a new linked parameter being added to a value
  const [newLinkedParam, setNewLinkedParam] = useState({
    param_key: "",
    allowed_values: [],
  })

  // Validation states
  const [keyError, setKeyError] = useState("")
  const [labelError, setLabelError] = useState("")
  const [valueKeyError, setValueKeyError] = useState("")

  // Fetch available parameters when the dialog opens
  useEffect(() => {
    if (open) {
      fetchParameters()
    }
  }, [open])

  const fetchParameters = async () => {
    setIsLoading(true)
    try {
      const response = await getParameters()
      // Transform data structure for use in the component
      const transformedParams = response.map((param) => ({
        key: param.key,
        label: param.label,
        values: param.values.map(value => value.label) // Use value.label as the value
      }))
      setAvailableParameters(transformedParams as any)
    } catch (error) {
      console.error("Error fetching parameters:", error)
      toast.error("فشل في جلب المعاملات المتاحة")
    } finally {
      setIsLoading(false)
    }
  }

  const validateKey = (key: string) => {
    if (!key) return "المعرف مطلوب"
    if (key.includes(" ")) return "المعرف لا يجب أن يحتوي على مسافات"
    if (!/^[\u0621-\u064A0-9_]+$/.test(key)) return "المعرف يجب أن يحتوي على أحرف عربية وأرقام وشرطة سفلية فقط"
    return ""
  }

  const validateLabel = (label: string) => {
    if (!label) return "التسمية مطلوبة"
    return ""
  }

  const handleParamChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target

    if (id === "label") {
      const error = validateLabel(value)
      setLabelError(error)

      // Auto-generate key from label
      const generatedKey = formatKeyExample(value)
      setParamData((prev) => ({
        ...prev,
        [id]: value,
        key: generatedKey,
      }))
      setKeyError(validateKey(generatedKey))
    } else {
      setParamData((prev) => ({ ...prev, [id]: value }))
    }
  }

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target

    if (id === "label") {
      // Auto-generate key from label, allowing for Arabic values
      const generatedKey = formatKeyExample(value)
      setNewValue((prev) => ({
        ...prev,
        [id]: value,
        key: generatedKey,
      }))
      setValueKeyError(validateKey(generatedKey))
    } else {
      setNewValue((prev) => ({ ...prev, [id]: value }))
    }
  }

  const toggleDependencies = (checked: boolean) => {
    setNewValue((prev) => ({
      ...prev,
      hasDependencies: checked,
      linked_params: checked ? prev.linked_params : [],
    }))
  }

  const selectParameter = (paramKey: string) => {
    setNewLinkedParam((prev) => ({
      ...prev,
      param_key: paramKey,
      allowed_values: [],
    }))
  }

  const toggleAllowedValue = (value: string, isChecked: boolean) => {
    setNewLinkedParam((prev) => {
      if (isChecked) {
        return {
          ...prev,
          allowed_values: [...prev.allowed_values, value],
        }
      } else {
        return {
          ...prev,
          allowed_values: prev.allowed_values.filter((v) => v !== value),
        }
      }
    })
  }

  const addLinkedParam = () => {
    if (!newLinkedParam.param_key || newLinkedParam.allowed_values.length === 0) {
      toast.error("يرجى تحديد معامل وقيم مسموح بها")
      return
    }

    setNewValue((prev) => ({
      ...prev,
      linked_params: [...prev.linked_params, { ...newLinkedParam }],
    }))

    // Reset new linked param
    setNewLinkedParam({
      param_key: "",
      allowed_values: [],
    })
  }

  const removeLinkedParam = (index: number) => {
    setNewValue((prev) => ({
      ...prev,
      linked_params: prev.linked_params.filter((_, i) => i !== index),
    }))
  }

  const addValue = () => {
    if (!newValue.key || !newValue.label) {
      toast.error("يرجى إدخال المعرف والقيمة")
      return
    }

    if (valueKeyError) {
      toast.error("يرجى تصحيح أخطاء المعرف")
      return
    }

    // Prepare value object
    const valueToAdd = {
      key: newValue.key,
      label: newValue.label,
    }

    // Add linked_params only if there are dependencies
    if (newValue.hasDependencies && newValue.linked_params.length > 0) {
      valueToAdd.linked_params = [...newValue.linked_params]
    }

    setParamData((prev: any) => ({
      ...prev,
      values: [...prev.values, valueToAdd],
    }))

    // Reset new value form
    setNewValue({
      key: "",
      label: "",
      hasDependencies: false,
      linked_params: [],
    })
    setValueKeyError("")
  }

  const removeValue = (index: number) => {
    setParamData((prev: any) => ({
      ...prev,
      values: prev.values.filter((_: any, i: number) => i !== index),
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Validate before submission
    const keyErr = validateKey(paramData.key)
    const labelErr = validateLabel(paramData.label)

    setKeyError(keyErr)
    setLabelError(labelErr)

    if (keyErr || labelErr || paramData.values.length === 0) {
      toast.error("يرجى تصحيح الأخطاء قبل الحفظ")
      return
    }

    setIsSubmitting(true)

    try {
      // Submit the full parameter with its values and dependencies
      const response = await createParameter(paramData as any)
      onAdd(response)

      // Reset form
      setParamData({
        key: "",
        label: "",
        values: [],
        updatedBy: "system",
        allowLinkedParams: true,
      })

      toast.success("تم الإضافة بنجاح", {
        description: "تمت إضافة نوع إجراء الملاحظة بنجاح",
      })
      setOpen(false)
    } catch (error) {
      console.error("Error creating parameter:", error)
      toast.error("حدث خطأ أثناء إضافة المعامل", {
        description: "حدث خطأ أثناء العملية",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Find parameter details by key
  const getParameterDetails = (paramKey: string) => {
    return availableParameters.find((param: any) => param.key === paramKey)
  }

  const formatKeyExample = (text: string) => {
    const isArabic = /[\u0600-\u06FF]/.test(text);
    
    return text
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(isArabic ? 
        /[^\u0600-\u06FF0-9_]/g : // Arabic mode
        /[^a-z0-9_]/g, // Latin mode
      '')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
  }

  return (
    <div className="flex items-center justify-end space-x-reverse " dir="rtl">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" />
            إضافة معامل جديد
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-xl">إضافة معامل جديد</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            {/* Main Parameter Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">تفاصيل المعامل</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="label">تسمية المعامل</Label>
                    <Input
                      id="label"
                      value={paramData.label}
                      onChange={handleParamChange}
                      placeholder="مثال: نوع القضية"
                      className={labelError ? "border-red-500" : ""}
                      dir="rtl"
                    />
                    {labelError && <p className="text-red-500 text-sm">{labelError}</p>}
                    {paramData.key && (
                      <div className="text-sm text-muted-foreground mt-1">
                        المعرف: <Badge variant="outline">{paramData.key}</Badge>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    {keyError && (
                      <Alert variant="destructive" className="py-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{keyError}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    id="allowLinkedParams"
                    checked={paramData.allowLinkedParams}
                    onCheckedChange={(checked: boolean) => {
                      setParamData(prev => ({
                        ...prev,
                        allowLinkedParams: checked,
                        // Reset all dependencies if disabled
                        values: checked ? prev.values : prev.values.map((value: any) => ({
                          ...value,
                          linked_params: []
                        }))
                      }))
                      
                      // Reset new value dependencies
                      setNewValue(prev => ({
                        ...prev,
                        hasDependencies: false,
                        linked_params: []
                      }))
                    }}
                  />
                  <Label htmlFor="allowLinkedParams" className="cursor-pointer">
                    السماح بإضافة معاملات مرتبطة لهذا المعامل
                  </Label>
                </div>
              </CardContent>
            </Card>

            {/* Values Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">القيم</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* List of Added Values */}
                {paramData.values.length > 0 ? (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">القيم المضافة:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {paramData.values.map((value: any, index: number) => (
                        <div key={index} className="flex items-center justify-between bg-muted p-3 rounded-md">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{value.label}</span>
                              <Badge variant="outline" className="text-xs">
                                {value.key}
                              </Badge>
                            </div>
                            {value.linked_params && value.linked_params.length > 0 && (
                              <div className="text-xs text-muted-foreground flex flex-wrap gap-1">
                                <span>يعتمد على:</span>
                                {value.linked_params.map((lp: any, i: number) => (
                                  <Badge key={i} variant="secondary" className="text-xs">
                                    {getParameterDetails(lp.param_key)?.label || lp.param_key}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeValue(index)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-100"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Alert variant="default" className="bg-amber-50 text-amber-800 border-amber-200">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>لم تتم إضافة أي قيم بعد. يجب إضافة قيمة واحدة على الأقل.</AlertDescription>
                  </Alert>
                )}

                {/* Add New Value Form */}
                <Card className="border-dashed">
                  <CardHeader className="py-3">
                    <CardTitle className="text-md">إضافة قيمة جديدة</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="label">تسمية القيمة</Label>
                        <Input
                          id="label"
                          value={newValue.label}
                          onChange={handleValueChange}
                          placeholder="مثال: قضية مدنية"
                          dir="rtl"
                        />
                        {newValue.key && (
                          <div className="text-sm text-muted-foreground mt-1">
                            المعرف: <Badge variant="outline">{newValue.key}</Badge>
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        {valueKeyError && (
                          <Alert variant="destructive" className="py-2">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{valueKeyError}</AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </div>

                    {/* Dependencies Toggle */}
                    {paramData.allowLinkedParams && (
                      <div className="space-y-4 border-t pt-4">
                        {/* Display current linked parameters */}
                        {newValue.linked_params.length > 0 && (
                          <div className="space-y-2">
                            <h5 className="text-sm font-medium">المعاملات المرتبطة:</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {newValue.linked_params.map((param: any, index: number) => {
                                const paramDetails = getParameterDetails(param.param_key)
                                return (
                                  <div
                                    key={index}
                                    className="flex items-center justify-between bg-muted p-3 rounded-md"
                                  >
                                    <div className="space-y-1">
                                      <span className="font-medium">{paramDetails?.label || param.param_key}</span>
                                      <div className="flex flex-wrap gap-1">
                                        {param.allowed_values.map((val: any, i: number) => (
                                          <Badge key={i} variant="secondary" className="text-xs">
                                            {val}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeLinkedParam(index)}
                                      className="text-red-500 hover:text-red-700 hover:bg-red-100"
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )}

                        {/* Add new linked parameter */}
                        <Card className="border-dashed">
                          <CardContent className="pt-4 space-y-3">
                            <h5 className="text-sm font-medium">ربط بمعامل</h5>

                            {isLoading ? (
                              <div className="flex items-center justify-center p-4">
                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                <span className="mr-2">جاري تحميل المعاملات...</span>
                              </div>
                            ) : (
                              <>
                                <div>
                                  <Label htmlFor="param_select">اختر معامل</Label>
                                  <Select value={newLinkedParam.param_key} onValueChange={selectParameter}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="اختر معامل" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {availableParameters.length > 0 ? (
                                        availableParameters.map((param: any) => (
                                          <SelectItem key={param.key} value={param.key}>
                                            {param.label}
                                          </SelectItem>
                                        ))
                                      ) : (
                                        <SelectItem value="no_params" disabled>
                                          لا توجد معاملات متاحة
                                        </SelectItem>
                                      )}
                                    </SelectContent>
                                  </Select>
                                </div>

                                {newLinkedParam.param_key && (
                                  <div className="space-y-2">
                                    <Label>القيم المسموح بها</Label>
                                    <div className="grid grid-cols-2 gap-2 border rounded-md p-2">
                                      {getParameterDetails(newLinkedParam.param_key)?.values?.map((value: any) => (
                                        <div key={value} className="flex items-center space-x-2 space-x-reverse">
                                          <Checkbox
                                            id={`val-${value}`}
                                            checked={newLinkedParam.allowed_values.includes(value)}
                                            onCheckedChange={(checked: boolean  ) => toggleAllowedValue(value, checked)}
                                          />
                                          <Label htmlFor={`val-${value}`} className="cursor-pointer">
                                            {value}
                                          </Label>
                                        </div>
                                      )) || <p>لا توجد قيم متاحة لهذا المعامل</p>}
                                    </div>
                                  </div>
                                )}
                              </>
                            )}

                            <div className="flex justify-end">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addLinkedParam}
                                disabled={isLoading || !newLinkedParam.param_key || newLinkedParam.allowed_values.length === 0}
                                className="gap-1"
                              >
                                <Plus className="h-4 w-4" />
                                إضافة ارتباط
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}

                    <div className="flex justify-end">
                      <Button
                        type="button"
                        onClick={addValue}
                        disabled={!newValue.key || !newValue.label || !!valueKeyError}
                        className="gap-1"
                      >
                        <Plus className="h-4 w-4" />
                        إضافة القيمة
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                إلغاء
              </Button>
              <Button
                type="submit"
                className="bg-primary hover:bg-primary/90 min-w-32"
                disabled={isSubmitting || paramData.values.length === 0 || !!keyError || !!labelError}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    حفظ المعامل
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AddParameter