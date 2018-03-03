/**
 * Choice field options populated from Script Include JSON object
 * 
 * Scenario:
 * 
 * Reference field "ref1" and Choice field "choice" exist on the form.
 * The choice field represents values that are related to ref1 either 
 * by dot walking or a many-to-many relationship.
 * User chooses a reference value in ref1 and related options are populated
 * in field choice.
 */

 /** Scrip Include
  * Returnsa JSON object to the client.
  * Json object contains the display value and database value for the choic
  * field.
  */

var ChoiceOptionsJSON = Class.create();
ChoiceOptionsJSON.prototype = Object.extendsObject(AbstractAjaxProcessor, {
  getChoiceOptionData: function () {
    //Create array to hold the GlideRecord query results
    var results = [];
    //Hold the value passed from the client in order to filter ref1Table
    var ref1Value = this.getParameter("sysparm_ref1Value");
    var gr = new GlideRecord("ref1RelatedToChoiceTable");
    gr.addQuery("ref1", ref1Value);
    gr.query();
    while (gr.next()) {
      var choiceDataObj = {};
      var gc = new GlideRecord("choiceTable");
      gc.get(gr.choiceRef);
      choiceDataObj.choiceColumn1 = gc.column1.toString();
      choiceDataObj.choiceColumn2 = gc.column2.toString();
      results.push(choiceDataObj);
    }
    return JSON.stringify(results);
  },
  type: 'ChoiceOptionsJSON'
});

/**
 * onChange Client Script uses GlideAjax to populate choice field
 * 
 * Scenario:
 * User chooses ref1 value. 
 * onChange Client Script calls GlideAjax to populate choice field.
 * The call to GlideAjax sends the chosen ref1 value as a parameter.
 */

function onChange(control, oldValue, newValue, isLoading, isTemplate) {
  if (isLoading || newValue === '') {
    return;
  }

  var ga = new GlideAjax("ChoiceOptionsJSON");
  ga.addParam("sysparm_name", "getChoiceOptionData");
  ga.addParam("sysparm_ref1Value", newValue);
  ga.getXML(parseResponse);

  function parseResponse(response) {
    g_form.clearOptions("choice");
    var results = JSON.parse(response.responseXML.documentElement.getAttribute("answer"));
    results.forEach(function (obj) {
      //addOption(fieldName, database value, display value)
      g_form.addOption("choice", obj.column1, obj.column2);
    });
  }
}