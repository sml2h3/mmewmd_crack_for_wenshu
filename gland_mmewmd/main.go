package main

import (
	"net/url"
	"fmt"
	"github.com/satori/go.uuid"
	"net/http"
	"time"
	"strings"
	"io/ioutil"
	"goquery"
	"regexp"
	"github.com/robertkrimen/otto"
	"github.com/wonderivan/logger"
)


type Cookies struct {
	C80T string
	C80S string
	Meta string
	Guid  string
	Number string
	Vjkl5  string
	Vl5x string
}

var (
	encryptPath = `/home/jialele/go/src/iris_test/wenshu/encrypt.js`
	ywtuPath = `/home/jialele/go/src/iris_test/wenshu/ywtu.js`
	vjkl5 = `/home/jialele/go/src/iris_test/wenshu/vjkl5.js`
)

func main() {
	var c Cookies
	c.GetCookie()
	c.execjs()
	c.Guid = `8df4cd4f-0d91-23411994-4bd54ad7a846`
	c.Number = `wens`
	c.SetCookie()
	c.WenShuList()
}

func (c *Cookies) execjs( )  {
	logger.Info("[--------Get---Cookie---80T-------]")
	js1,e := ioutil.ReadFile(encryptPath)
	js2,e := ioutil.ReadFile(ywtuPath)
	if e !=nil{
		panic(e)
	}
	mv1 := otto.New()
	mv2 := otto.New()
	mv1.Run(string(js1))
	mv2.Run(string(js2))
	ywtu ,e:= mv2.Call(`getc`,nil,c.Meta)
	res ,e := mv1.Call("getCookies",nil,c.Meta,c.C80T,ywtu.String())
	c.C80T = res.String()
	logger.Info("Cookie 80T : < %s >",res.String())

}
func(c *Cookies) SetCookie() {
	logger.Info("[--------Get---Vjkl5-------]")
	url := fmt.Sprintf("http://wenshu.court.gov.cn/list/list/?sorttype=1&guid=%s&number=%s",c.Guid,c.Number)
	client := http.Client{}
	req,err:= http.NewRequest("GET",url,nil)
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36")
	req.Header.Set("Cookie",fmt.Sprintf("FSSBBIl1UgzbN7N80S=%s;FSSBBIl1UgzbN7N80T=%s",c.C80S,c.C80T))
	if err != nil {
		fmt.Println(err)
	}
	response, err := client.Do(req)
	defer response.Body.Close()
	if err != nil {
		fmt.Println(err)
	}
	cookie := response.Header.Get("Set-Cookie")
	re := regexp.MustCompile("vjkl5=(.*?);")
	vjkl5 := re.FindStringSubmatch(cookie)[1]
	c.Vjkl5 = vjkl5
	c.Vl5x = GetVjkl5(vjkl5)
	logger.Info("vjkl5 : < %s >",c.Vjkl5)
	logger.Info("Vl5x : < %s >",c.Vl5x)

}
func GetVjkl5(key string) string{

	js,_ := ioutil.ReadFile(vjkl5)
	mv := otto.New()
	mv.Run(js)
	res,_ :=mv.Call("getKey",nil,key)
	return res.String()

}
func (c *Cookies) GetCookie() {
	logger.Info("[--------Get---Cookies-------]")
	codeUrl := "http://wenshu.court.gov.cn/list/list/?sorttype=1"
	client := http.Client{Timeout:60*time.Second}
	req,err:= http.NewRequest("GET",codeUrl,nil)
	if err != nil {
		fmt.Println(err)
	}
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36")
	req.Header.Set("Content-Type","application/x-www-form-urlencoded;charset=UTF-8")
	response, err := client.Do(req)
	defer response.Body.Close()
	if err != nil {
		fmt.Println(err)
	}
	cookie  := response.Cookies()
	FSSBBIl1UgzbN7N80T := ""
	FSSBBIl1UgzbN7N80S := ""
	for _,v := range cookie{
		if v.Name == `FSSBBIl1UgzbN7N80T`{
			FSSBBIl1UgzbN7N80T = v.Value
		}
		if v.Name == `FSSBBIl1UgzbN7N80S` {
			FSSBBIl1UgzbN7N80S = v.Value
		}
	}
	doc,_ :=goquery.NewDocumentFromReader(response.Body)
	meta,_ := doc.Find(`#9DhefwqGPrzGxEp9hPaoag`).Attr(`content`)
	c.C80S = FSSBBIl1UgzbN7N80S
	c.C80T = FSSBBIl1UgzbN7N80T
	c.Meta = strings.TrimSpace(meta)
	logger.Info("Cookies get Success!")
}

func(c *Cookies)  GetNumber() {
	logger.Info("[--------Get---GetNumber-------]")
	var postData = url.Values{}
	gd,_ := uuid.NewV4()
	guid :=gd.String()
	codeUrl := "http://wenshu.court.gov.cn/ValiCode/GetCode?"
	client := http.Client{Timeout:60*time.Second}
	postData.Add("guid",guid)
	data := postData.Encode()
	req,err:= http.NewRequest("POST",codeUrl,strings.NewReader(data))
	if err != nil {
		fmt.Println(err)
	}
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36")
	req.Header.Set("Content-Type","application/x-www-form-urlencoded;charset=UTF-8")
	response, err := client.Do(req)
	defer response.Body.Close()
	if err != nil {
		fmt.Println(err)
	}
	number,_ := ioutil.ReadAll(response.Body)
	if response.StatusCode == http.StatusOK{
		c.Guid = guid
		c.Number = string(number)
	}
	logger.Info("Number  < %s >",number)
}

func (c *Cookies) WenShuList() {
	logger.Info("[--------Get---List--Information-------]")
	var postData = url.Values{}
	url := "http://wenshu.court.gov.cn/List/ListContent"
	postData.Add("Param","案件类型:民事案件")
	postData.Add("Index","1")
	postData.Add("Page","10")
	postData.Add("Order","法院层级")
	postData.Add("Direction","asc")
	postData.Add("vl5x",c.Vl5x)
	postData.Add("number",c.Number)
	postData.Add("guid",c.Guid)
	data := postData.Encode()
	client := &http.Client{}
	request, _ := http.NewRequest("POST", url, strings.NewReader(data))
	request.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36")
	request.Header.Set("Content-Type","application/x-www-form-urlencoded;charset=UTF-8")
	request.Header.Set("Cookie",fmt.Sprintf("FSSBBIl1UgzbN7N80S=%s;FSSBBIl1UgzbN7N80T=%s;vjkl5=%s",c.C80S,c.C80T,c.Vjkl5))
	response, err := client.Do(request)
	defer response.Body.Close()
	if err != nil {
		fmt.Println(err)
	}
	res,_ := ioutil.ReadAll(response.Body)
	fmt.Println(string(res))
}


